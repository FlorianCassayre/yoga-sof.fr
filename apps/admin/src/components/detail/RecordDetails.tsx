'use client';

import { Box, Card, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import type { ReactNode } from 'react';

export interface RecordDetailsEntry {
  label: string;
  value: ReactNode;
}

interface RecordDetailsProps {
  entries: RecordDetailsEntry[];
}

export const RecordDetails = ({ entries }: RecordDetailsProps) => {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Card variant="outlined">
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableBody>
              {entries.map(({ label, value }) => (
                <TableRow key={label}>
                  <TableCell component="th" scope="row" align="right" variant="head">
                    {label}
                  </TableCell>
                  <TableCell sx={{ overflowWrap: 'anywhere' }}>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
