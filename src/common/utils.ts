// https://github.com/rayepps/radash/blob/master/src/object.ts
export const mapValues = <
  TValue,
  TKey extends string | number | symbol,
  TNewValue
>(
  obj: Record<TKey, TValue>,
  mapFunc: (value: TValue, key: TKey) => TNewValue
): Record<TKey, TNewValue> => {
  const keys = Object.keys(obj) as TKey[]
  return keys.reduce((acc, key) => {
    acc[key] = mapFunc(obj[key], key)
    return acc
  }, {} as Record<TKey, TNewValue>)
};

// https://github.com/rayepps/radash/blob/master/src/object.ts
export const mapEntries = <
  TKey extends string | number | symbol,
  TValue,
  TNewKey extends string | number | symbol,
  TNewValue
>(
  obj: Record<TKey, TValue>,
  toEntry: (key: TKey, value: TValue) => [TNewKey, TNewValue]
): Record<TNewKey, TNewValue> => {
  if (!obj) return {} as Record<TNewKey, TNewValue>
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const [newKey, newValue] = toEntry(key as TKey, value as TValue)
    acc[newKey] = newValue
    return acc
  }, {} as Record<TNewKey, TNewValue>)
};

export type ValidateSubtype<T, U extends T> = U;

export type DeepNullable<T> = {
  [K in keyof T]: DeepNullable<T[K]> | null;
};
