import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { formatEuro, GaufresProcessedData } from './sales';

interface SalesDayTableProps {
  data: GaufresProcessedData['days'];
}

export const SalesDayTable: React.FC<SalesDayTableProps> = ({ data }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Jour</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Recettes</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total ventes (*)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell align="center">{row.date}</TableCell>
              <TableCell align="right">{formatEuro(row.totalEuro)}</TableCell>
              <TableCell align="right">{row.totalSoldDay}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
