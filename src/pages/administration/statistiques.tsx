import React, { useMemo } from 'react';
import { BackofficeContent } from '../../components/layout/admin/BackofficeContent';
import { Timeline } from '@mui/icons-material';
import { Box, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { trpc } from '../../common/trpc';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const AggregatedTotalPayments: React.FC = () => {
  const { data, isLoading } = trpc.statistics.findAggregatedPayments.useQuery({ aggregation: 'month' as any });
  const theme = useTheme();
  const height = 300;
  return !isLoading ? !!data ? (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data.data.map(([name, value]) => ({ name, value }))}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis unit=" €" />
        <Bar dataKey="value" fill={theme.palette.primary.light} />
      </BarChart>
    </ResponsiveContainer>
  ) : null : (
    <Skeleton variant="rounded" height={height} />
  );
};

const ProportionPie: React.FC = () => {
  const { data, isLoading } = trpc.statistics.findPaymentsCategories.useQuery();
  const theme = useTheme();
  const dataArray = useMemo(() => data ? [
    { name: 'Séances', value: data.courseRegistrations, color: theme.palette.info.light },
    { name: 'Cartes', value: data.coupons, color: theme.palette.success.light },
    { name: 'Adhésions', value: data.memberships, color: theme.palette.secondary.light },
  ].sort(({ value: v1 }, { value: v2 }) => v2 - v1) : undefined, [data]);
  const legendSize = 16;
  // From: https://recharts.org/en-US/examples/PieChartWithCustomizedLabel
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: { cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, percent: number, index: number }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  const height = 250;
  return !isLoading ? !!dataArray ? (
    <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart >
          <Pie
            data={dataArray}
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={height / 2}
            dataKey="value"
          >
            {dataArray.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <Stack direction="row" spacing={{ xs: 2, sm: 4 }} justifyContent="center">
        {dataArray.map(({ name, color }, index) => (
          <Stack key={index} direction="row" spacing={1} alignItems="center">
            <Box width={legendSize} height={legendSize} sx={{ borderRadius: 1, backgroundColor: color }} />
            <Box>
              {name}
            </Box>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ) : null : (
    <Box justifyContent="center" sx={{ mb: 7 }}>
      <Skeleton variant="circular" width={height} height={height} sx={{ mx: 'auto' }} />
    </Box>
  );
};

export default function AdminStatistics() {
  return (
    <BackofficeContent
      title="Statistiques"
      icon={<Timeline />}
    >
      <Typography variant="h5" component="div">
        Répartition des recettes
      </Typography>
      <Typography paragraph>
        Répartition des recettes par type d'article.
      </Typography>
      <ProportionPie />

      <Typography variant="h5" component="div">
        Recettes par mois
      </Typography>
      <Typography paragraph>
        Les recettes mensuelles.
      </Typography>
      <AggregatedTotalPayments />
    </BackofficeContent>
  );
}
