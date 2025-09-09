import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { colonTimeToParts, timePartsToTotalMinutes } from '../../../common/date';
import { GaufresProcessedData } from './sales';
import { useTheme } from '@mui/material';

interface SalesDayChartProps {
  data: GaufresProcessedData['days'][number]['totalSoldPerTime'];
}

export const SalesDayChart: React.FC<SalesDayChartProps> = ({ data }) => {
  const theme = useTheme();
  const parsedData = data.map(d => ({
    ...d,
    timeValue: timePartsToTotalMinutes(colonTimeToParts(d.time)),
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={parsedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="timeValue"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(val) => {
            const hours = Math.floor(val / 60);
            const minutes = val % 60;
            return `${hours.toString().padStart(2, "0")}h${minutes.toString().padStart(2, "0")}`;
          }}
        />
        <YAxis />
        <Line
          type="monotone"
          dataKey="count"
          stroke={theme.palette.primary.main}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 3 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
