import React, { useMemo, useState } from 'react';
import { BackofficeContent } from '../../components/layout/admin/BackofficeContent';
import { Timeline } from '@mui/icons-material';
import { Box, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { trpc } from '../../common/trpc';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import { PaymentRecipient } from '@prisma/client';
import { PaymentRecipientNames } from '../../common/payment';
import { cyan, teal } from '@mui/material/colors';

interface ColorLegendProps {
  items: { name: string, color: string }[];
  disabled: Partial<Record<string, boolean>>;
  onToggle: (id: number) => void;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ items, disabled, onToggle }) => {
  const legendSize = 16;
  const isVisible = (index: number): boolean => !disabled[index];
  return (
    <Grid container columnGap={{ xs: 2, sm: 4 }} rowGap={2} justifyContent="center">
      {items.map(({ name, color }, index) => (
        <Grid key={index} item xs="auto">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => onToggle(index)}>
            <Box width={legendSize} height={legendSize} sx={{ borderRadius: 1, backgroundColor: color, filter: isVisible(index) ? undefined : 'grayscale(100%)' }} />
            <Box sx={{ textDecoration: isVisible(index) ? undefined : 'line-through' }}>
              {name}
            </Box>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}

const AggregatedTotalPayments: React.FC = () => {
  const { data, isLoading } = trpc.statistics.findAggregatedPayments.useQuery({ aggregation: 'month' as any });
  const [disabled, setDisabled] = useState<Partial<Record<number, boolean>>>({});
  const height = 300;
  const legend = [
    { name: PaymentRecipientNames[PaymentRecipient.ORGANIZATION], color: cyan[500] },
    { name: PaymentRecipientNames[PaymentRecipient.ENTERPRISE], color: teal[500] },
  ];
  return !isLoading ? !!data ? (
    <Stack direction="column">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data.data.map(([name, value]) => ({
            name,
            organizationIncomes: value[PaymentRecipient.ORGANIZATION].incomes,
            organizationExpenses: -value[PaymentRecipient.ORGANIZATION].expenses,
            enterpriseIncomes: value[PaymentRecipient.ENTERPRISE].incomes,
            enterpriseExpenses: -value[PaymentRecipient.ENTERPRISE].expenses,
          }))}
          stackOffset="sign"
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis unit=" €" />
          <ReferenceLine y={0} stroke="#000" />
          {!disabled[0] && <Bar dataKey="organizationIncomes" stackId="value" fill={legend[0].color} />}
          {!disabled[0] && <Bar dataKey="organizationExpenses" stackId="value" fill={legend[0].color} />}
          {!disabled[1] && <Bar dataKey="enterpriseIncomes" stackId="value" fill={legend[1].color} />}
          {!disabled[1] && <Bar dataKey="enterpriseExpenses" stackId="value" fill={legend[1].color} />}
        </BarChart>
      </ResponsiveContainer>
      <ColorLegend items={legend} disabled={disabled} onToggle={(index) => setDisabled({ ...disabled, [index]: !disabled[index] })} />
    </Stack>
  ) : null : (
    <Skeleton variant="rectangular" height={height} />
  );
};

interface ProportionPieProps {
  recipient: PaymentRecipient;
  expenses: boolean;
}

const ProportionPie: React.FC<ProportionPieProps> = ({ recipient, expenses }) => {
  const { data, isLoading } = trpc.statistics.findPaymentsCategories.useQuery({ recipient });
  const [disabled, setDisabled] = useState<Record<number, boolean>>({});
  const minOpacity = 0.25;
  const dataArray = useMemo(() => data ?
    (() => {
      const bucket = data[!expenses ? 'incomes' : 'expenses']
      return bucket.map((item, i) => ({ ...item, color: `rgba(3, 169, 244, ${minOpacity + (1 - minOpacity) * (bucket.length - i) / bucket.length})` }))
    })()
    : undefined, [data]);
  const dataArrayFiltered = useMemo(() => dataArray !== undefined ? dataArray.filter((_, index) => !disabled[index]) : undefined, [dataArray, disabled]);
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
  return !isLoading ? !!dataArray && !!dataArrayFiltered ? (
    <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
      <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
        {PaymentRecipientNames[recipient]}
      </Typography>
      <Typography variant="subtitle2" component="div" sx={{ textAlign: 'center', color: !expenses ? 'success.main' : 'error.main' }} style={{ marginTop: 0 }}>
        {!expenses ? 'Recettes' : 'Dépenses'}
      </Typography>
      {dataArray.some(({ value }) => value > 0) ? (
        <>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart >
              <Pie
                data={dataArrayFiltered}
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={height / 2}
                startAngle={startAngle}
                endAngle={360 + startAngle}
                dataKey="value"
              >
                {dataArrayFiltered.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <ColorLegend items={dataArray} disabled={disabled} onToggle={(index: number) => setDisabled({ ...disabled, [index]: !disabled[index] })} />
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
        Répartition des recettes et dépenses
      </Typography>
      <Typography paragraph>
        Répartition des recettes et dépenses par type d'article.
      </Typography>
      <Grid container>
        {[false, true].map(expenses =>
          Object.keys(PaymentRecipient).map(recipient => (
            <Grid key={`${recipient}-${expenses}`} item lg={6} xs={12}>
              <ProportionPie recipient={recipient as PaymentRecipient} expenses={expenses} />
            </Grid>
          ))
        )}
      </Grid>

      <Typography variant="h6" component="div">
        Recettes et dépenses par mois
      </Typography>
      <Typography paragraph>
        Les recettes et dépenses mensuelles.
      </Typography>
      <AggregatedTotalPayments />
    </BackofficeContent>
  );
}
