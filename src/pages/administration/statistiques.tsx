import React, { useMemo } from 'react';
import { BackofficeContent } from '../../components/layout/admin/BackofficeContent';
import { Timeline } from '@mui/icons-material';
import { Box, Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { trpc } from '../../common/trpc';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { PaymentRecipient } from '@prisma/client';
import { PaymentRecipientNames } from '../../common/payment';

interface ColorLegendProps {
  items: { name: string, color: string }[],
}

const ColorLegend: React.FC<ColorLegendProps> = ({ items }) => {
  const legendSize = 16;
  return (
    <Stack direction="row" spacing={{ xs: 2, sm: 4 }} justifyContent="center">
      {items.map(({ name, color }, index) => (
        <Stack key={index} direction="row" spacing={1} alignItems="center">
          <Box width={legendSize} height={legendSize} sx={{ borderRadius: 1, backgroundColor: color }} />
          <Box>
            {name}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

const AggregatedTotalPayments: React.FC = () => {
  const { data, isLoading } = trpc.statistics.findAggregatedPayments.useQuery({ aggregation: 'month' as any });
  const theme = useTheme();
  const height = 300;
  const legend = [
    { name: PaymentRecipientNames[PaymentRecipient.ORGANIZATION], color: theme.palette.warning.light },
    { name: PaymentRecipientNames[PaymentRecipient.ENTERPRISE], color: theme.palette.error.light },
  ];
  return !isLoading ? !!data ? (
    <Stack direction="column">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data.data.map(([name, value]) => ({ name, organization: value[PaymentRecipient.ORGANIZATION], enterprise: value[PaymentRecipient.ENTERPRISE] }))}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis unit=" €" />
          <Bar dataKey="organization" stackId="value" fill={legend[0].color} />
          <Bar dataKey="enterprise" stackId="value" fill={legend[1].color} />
        </BarChart>
      </ResponsiveContainer>
      <ColorLegend items={legend} />
    </Stack>
  ) : null : (
    <Skeleton variant="rectangular" height={height} />
  );
};

interface ProportionPieProps {
  recipient: PaymentRecipient;
}

const ProportionPie: React.FC<ProportionPieProps> = ({ recipient }) => {
  const { data, isLoading } = trpc.statistics.findPaymentsCategories.useQuery({ recipient });
  const theme = useTheme();
  const dataArray = useMemo(() => data ? [
    { name: 'Séances', value: data.courseRegistrations, color: theme.palette.info.light },
    { name: 'Cartes', value: data.coupons, color: theme.palette.success.light },
    { name: 'Adhésions', value: data.memberships, color: theme.palette.secondary.light },
  ].filter(({ value }) => value > 0).sort(({ value: v1 }, { value: v2 }) => v2 - v1) : undefined, [data]);
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
  const startAngle = 45;
  return !isLoading ? !!dataArray ? (
    <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
      <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
        {PaymentRecipientNames[recipient]}
      </Typography>
      {dataArray.some(({ value }) => value > 0) ? (
        <>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart >
              <Pie
                data={dataArray}
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={height / 2}
                startAngle={startAngle}
                endAngle={360 + startAngle}
                dataKey="value"
              >
                {dataArray.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <ColorLegend items={dataArray} />
        </>
      ) : (
        <Typography sx={{ textAlign: 'center' }}>
          Aucune donnée
        </Typography>
      )}
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
      <Typography variant="h6" component="div">
        Répartition des recettes
      </Typography>
      <Typography paragraph>
        Répartition des recettes par type d'article.
      </Typography>
      <Grid container>
        {Object.keys(PaymentRecipient).map(recipient => (
          <Grid key={recipient} item lg={6} xs={12}>
            <ProportionPie recipient={recipient as PaymentRecipient} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" component="div">
        Recettes par mois
      </Typography>
      <Typography paragraph>
        Les recettes mensuelles.
      </Typography>
      <AggregatedTotalPayments />
    </BackofficeContent>
  );
}
