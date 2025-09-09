import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { GaufresProcessedData } from './sales';
import { useTheme } from '@mui/material';

interface SalesItemsChartProps {
  data: GaufresProcessedData;
}

export const SalesItemsChart: React.FC<SalesItemsChartProps> = ({ data }) => {
  const theme = useTheme();
  const dayLabels = data.days.map(day => day.date);

  let allItems = Array.from(
    new Set(data.days.flatMap(day => day.itemsSold.map(item => item.label)))
  );

  const itemTotals: Record<string, number> = {};
  allItems.forEach(itemLabel => {
    itemTotals[itemLabel] = data.days.reduce((sum, day) => {
      const found = day.itemsSold.find(item => item.label === itemLabel);
      return sum + (found ? found.count : 0);
    }, 0);
  });

  const allItemsSorted = allItems.filter(item => itemTotals[item] > 0).sort((a, b) => itemTotals[b] - itemTotals[a]);

  const chartData = allItemsSorted.map(itemLabel => {
    const obj: any = { item: itemLabel };
    data.days.forEach(day => {
      const totalForDay = day.itemsSold.reduce((sum, item) => sum + item.count, 0) || 1;
      const found = day.itemsSold.find(item => item.label === itemLabel);
      obj[day.date] = found ? (found.count / totalForDay) * 100 : 0;
    });
    return obj;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barCategoryGap="20%"
      >
        <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="item"
          interval={0} // 0 = show all ticks
          tick={{ fontSize: 10 }}
        />
        <YAxis unit="%" />
        <Legend />
        {dayLabels.map((day, idx) => (
          <Bar
            key={day}
            dataKey={day}
            fill={[theme.palette.success.main, theme.palette.secondary.main, theme.palette.warning.main][idx]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
