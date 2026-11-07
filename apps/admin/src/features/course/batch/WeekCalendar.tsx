'use client';

import { Box, Card, styled } from '@mui/material';
import type { PickerDayProps } from '@mui/x-date-pickers';
import { DateCalendar, PickerDay } from '@mui/x-date-pickers';
import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import type { ComponentType } from 'react';
import { createContext, useContext, useRef, useState } from 'react';

interface WeekCalendarContextValue {
  selectedWeeks: string[];
  hoveredDay: Date | null;
  onWeekToggle: (day: Date) => void;
  onDayHover: (day: Date | null) => void;
}

const WeekCalendarContext = createContext<WeekCalendarContextValue | null>(null);

const weekStart = (day: Date): Date => startOfWeek(day, { weekStartsOn: 1 });

const weekRange = (from: string, to: string): string[] => {
  const [start, end] = from <= to ? [from, to] : [to, from];
  const result: string[] = [];
  let cursor = parseISO(start);
  const limit = parseISO(end);

  while (cursor <= limit) {
    result.push(format(cursor, 'yyyy-MM-dd'));
    cursor = addDays(cursor, 7);
  }

  return result;
};

interface WeekPickerDayProps extends PickerDayProps {
  isSelected: boolean;
  isHovered: boolean;
}

const WeekPickerDay = styled(PickerDay, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isHovered',
})<WeekPickerDayProps>(({ theme, isSelected, isHovered, day }) => ({
  '--PickerDay-horizontalMargin': 0,
  boxSizing: 'content-box',
  paddingLeft: '2px',
  paddingRight: '2px',
  borderRadius: 0,
  ...(isSelected && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.main,
    },
  }),
  ...(isHovered && {
    backgroundColor: theme.palette.primary.light,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.light,
    },
  }),
  ...(day.getDay() === 1 && {
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
  }),
  ...(day.getDay() === 0 && {
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
  }),
})) as ComponentType<WeekPickerDayProps>;

const WeekDay = (props: PickerDayProps) => {
  const { selectedWeeks, hoveredDay, onWeekToggle, onDayHover } = useContext(WeekCalendarContext)!;
  const monday = weekStart(props.day);

  return (
    <WeekPickerDay
      {...props}
      day={props.day}
      selected={false}
      isSelected={selectedWeeks.includes(format(monday, 'yyyy-MM-dd'))}
      isHovered={hoveredDay !== null && isSameDay(weekStart(hoveredDay), monday)}
      onClick={() => onWeekToggle(props.day)}
      onPointerEnter={() => onDayHover(props.day)}
    />
  );
};

interface WeekCalendarProps {
  weeks: string[];
  onChange: (weeks: string[]) => void;
  disabled?: boolean;
}

export const WeekCalendar = ({ weeks: initialWeeks, onChange, disabled }: WeekCalendarProps) => {
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [committed, setCommitted] = useState<string[]>(initialWeeks);
  const anchorRef = useRef<string | null>(null);

  const onWeekToggle = (day: Date) => {
    const monday = format(weekStart(day), 'yyyy-MM-dd');
    if (anchorRef.current === null) {
      anchorRef.current = monday;
      setAnchor(monday);
      setCommitted([monday]);
      onChange([monday]);

      return;
    }
    const range = weekRange(anchorRef.current, monday);
    anchorRef.current = null;
    setAnchor(null);
    setCommitted(range);
    onChange(range);
  };

  const selectedWeeks =
    anchor === null
      ? committed
      : hoveredDay === null
        ? [anchor]
        : weekRange(anchor, format(weekStart(hoveredDay), 'yyyy-MM-dd'));
  const context: WeekCalendarContextValue = {
    selectedWeeks,
    hoveredDay,
    onWeekToggle,
    onDayHover: setHoveredDay,
  };
  const minDate = weekStart(new Date());

  return (
    <Card variant="outlined">
      <Box onPointerLeave={() => setHoveredDay(null)}>
        <WeekCalendarContext.Provider value={context}>
          <DateCalendar
            minDate={minDate}
            showDaysOutsideCurrentMonth
            displayWeekNumber
            disabled={disabled}
            slots={{ day: WeekDay }}
          />
        </WeekCalendarContext.Provider>
      </Box>
    </Card>
  );
};
