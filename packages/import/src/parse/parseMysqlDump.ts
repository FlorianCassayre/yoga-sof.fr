type MysqlValue = string | number | null;
interface MysqlInsert {
  table: string;
  values: MysqlValue[][];
}

const STRING_ESCAPES: Record<string, string> = {
  n: '\n',
  r: '\r',
  t: '\t',
  b: '\b',
  '0': '\0',
  Z: '\x1a',
};

const WHITESPACE = ' \t\r\n';

const skipWhitespace = (dump: string, start: number): number => {
  let i = start;
  while (WHITESPACE.includes(dump[i] ?? '')) {
    i++;
  }
  return i;
};

const seek = (dump: string, start: number, stop: string): number => {
  let i = start;
  while (!stop.includes(dump[i] ?? '')) {
    if (i >= dump.length) {
      throw new Error(`Unterminated value at offset ${start}.`);
    }
    i++;
  }
  return i;
};

const parseString = (dump: string, start: number): [string, number] => {
  let i = start + 1;
  let value = '';
  for (;;) {
    const char = dump[i];
    if (char === undefined) {
      throw new Error(`Unterminated string at offset ${start}.`);
    }
    if (char === '\\') {
      const escaped = dump[i + 1] ?? '';
      value += STRING_ESCAPES[escaped] ?? escaped;
      i += 2;
      continue;
    }
    if (char === "'") {
      if (dump[i + 1] === "'") {
        value += "'";
        i += 2;
        continue;
      }
      return [value, i + 1];
    }
    value += char;
    i++;
  }
};

const parseTuples = (dump: string, start: number): { values: MysqlValue[][]; end: number } => {
  const values: MysqlValue[][] = [];
  let i = start;
  for (;;) {
    i = skipWhitespace(dump, i);
    if (dump[i] !== '(') {
      throw new Error(`Expected '(' at offset ${i}.`);
    }
    i++;
    const tuple: MysqlValue[] = [];
    for (;;) {
      i = skipWhitespace(dump, i);
      if (dump[i] === "'") {
        const [value, end] = parseString(dump, i);
        tuple.push(value);
        i = end;
      } else if (dump.startsWith('NULL', i)) {
        tuple.push(null);
        i += 4;
      } else if (dump.startsWith('_binary', i)) {
        i = skipWhitespace(dump, i + '_binary'.length);
        const [value, end] = parseString(dump, i);
        tuple.push(value);
        i = end;
      } else {
        const valueEnd = seek(dump, i, ',)');
        const raw = dump.slice(i, valueEnd).trim();
        const value = Number(raw);
        if (raw === '' || Number.isNaN(value)) {
          throw new Error(`Unexpected token '${raw}' at offset ${i}.`);
        }
        tuple.push(value);
        i = valueEnd;
      }
      i = skipWhitespace(dump, i);
      if (dump[i] === ',') {
        i++;
        continue;
      }
      if (dump[i] === ')') {
        i++;
        break;
      }
      throw new Error(`Expected ',' or ')' at offset ${i}.`);
    }
    values.push(tuple);
    i = skipWhitespace(dump, i);
    if (dump[i] === ',') {
      i++;
      continue;
    }
    if (dump[i] === ';') {
      i++;
      break;
    }
    throw new Error(`Expected ',' or ';' at offset ${i}.`);
  }
  return { values, end: i };
};

const parseMysqlInserts = (dump: string, tables: string[]): MysqlInsert[] => {
  const wanted = new Set(tables);
  const valuesByTable = new Map<string, MysqlValue[][]>();
  const marker = 'INSERT INTO `';
  let index = dump.indexOf(marker);
  while (index !== -1) {
    const nameStart = index + marker.length;
    const nameEnd = dump.indexOf('`', nameStart);
    const table = dump.slice(nameStart, nameEnd);
    const valuesStart = nameEnd + 1 + dump.slice(nameEnd + 1).indexOf(' VALUES') + ' VALUES'.length;
    let next = dump.indexOf(marker, nameEnd);
    // A table may be spread over several INSERT statements — the chunks
    // concatenate in dump order.
    if (
      wanted.has(table) &&
      /^\s*$/.test(dump.slice(nameEnd + 1, valuesStart - ' VALUES'.length))
    ) {
      const parsed = parseTuples(dump, valuesStart);
      valuesByTable.set(table, [...(valuesByTable.get(table) ?? []), ...parsed.values]);
      next = dump.indexOf(marker, parsed.end);
    }
    index = next;
  }
  return [...valuesByTable].map(([table, values]) => ({ table, values }));
};

export { parseMysqlInserts };
export type { MysqlInsert, MysqlValue };
