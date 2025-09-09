import React, { useState } from 'react';
import { Button, ButtonGroup, Stack } from '@mui/material';
import { SalesDayChart } from './SalesDayChart';
import { GaufresProcessedData } from './sales';

interface SalesChartProps {
  data: GaufresProcessedData['days'];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  return (
    <>
      <Stack direction="row" justifyContent="center">
        <ButtonGroup>
          {data.map((day, i) => (
            <Button
              key={i}
              variant={i === selectedDayIndex ? 'contained' : 'outlined'}
              onClick={() => setSelectedDayIndex(i)}
            >
              {day.date}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>
      <SalesDayChart data={data[selectedDayIndex].totalSoldPerTime} />
    </>
  )
}
