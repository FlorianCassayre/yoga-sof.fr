import React from 'react';
import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { ArrowRightAlt } from '@mui/icons-material';
import { TransactionTypeNames } from '../common/transaction';
import { TransactionType } from '@prisma/client';

interface PurchasedItem {
  item: React.ReactNode;
  oldPrice?: number;
  price: number;
  discount?: React.ReactNode;
}

interface PurchasesTableProps {
  rows: PurchasedItem[];
  totalToPay: number;
  paid?: {
    amount: number;
    type?: TransactionType;
  };
  small?: boolean;
}

export const PurchasesTable: React.FC<PurchasesTableProps> = ({ rows, totalToPay, paid, small }) => {

  const displayPrice = (price: number) => `${price} €`;

  // Trick from: https://stackoverflow.com/a/43615091
  const shrink = {
    width: '0.1%',
    whiteSpace: 'nowrap',
  };

  return (
    <Table size={small ? 'small' : undefined}>
      <TableHead>
        <TableRow>
          <TableCell variant="head">Article</TableCell>
          <TableCell variant="head" sx={shrink}>Prix</TableCell>
          <TableCell variant="head">Réduction</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(({ item, oldPrice, price, discount }, i) => (
          <TableRow key={i}>
            <TableCell>{item}</TableCell>
            <TableCell align="right" sx={shrink}>
              {oldPrice !== undefined ?
                (
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="flex-end">
                    <Box sx={{ textDecoration: 'line-through' }}>{displayPrice(oldPrice)}</Box>
                    <ArrowRightAlt color="action" />
                    <Box>{displayPrice(price)}</Box>
                  </Stack>
                ) :
                displayPrice(price)}
            </TableCell>
            <TableCell>{discount}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell variant="head" align="right">Total à payer</TableCell>
          <TableCell align="right" sx={shrink}>{displayPrice(totalToPay)}</TableCell>
          <TableCell>{null}</TableCell>
        </TableRow>
        {paid && (
          <TableRow>
            <TableCell variant="head" align="right">Total payé</TableCell>
            <TableCell align="right" sx={shrink}>{displayPrice(paid.amount ?? 0)}</TableCell>
            <TableCell>{paid.type !== undefined ? TransactionTypeNames[paid.type] : null}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
