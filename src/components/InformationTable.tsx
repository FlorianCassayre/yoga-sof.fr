import React from 'react';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';

interface InformationRow {
  header: string;
  value: React.ReactNode;
}

interface InformationTableProps {
  rows: InformationRow[];
}

export const InformationTable: React.FC<InformationTableProps> = ({ rows }) => {
  return (
    <Table size="small">
      <TableBody>
        {rows.map(({ header, value }, i) => (
          <TableRow key={i}>
            <TableCell variant="head" align="right">{header}</TableCell>
            <TableCell align="left">{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
