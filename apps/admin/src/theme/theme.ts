import { createTheme, type Theme, type ThemeOptions } from '@mui/material';
import { frFR } from '@mui/x-scheduler/locales';
import type { SchedulerComponents } from '@mui/x-scheduler/theme-augmentation';
import { appLocale } from '@yoga-sof/core';
import { muiAppLocale } from '@yoga-sof/ui/muiAppLocale';
import { theme as baseTheme } from '@yoga-sof/ui/theme/theme';

import { MuiCard } from './components/MuiCard';
import { MuiDataGrid } from './components/MuiDataGrid';
import { MuiTableCell } from './components/MuiTableCell';

const PRIMARY_MAIN = '#7F9350';

// The read-only event dialog has no injection slot: the calendar portals a
// participants section into it.
const eventDialogOverrides: NonNullable<ThemeOptions['components']>['MuiEventDialog'] = {
  styleOverrides: {
    eventDialogResourceContainer: { display: 'none' },
    eventDialogReadonlyContent: ({ theme }: { theme: Theme }) => ({
      '& [data-course-participants]': {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
      },
      '& [data-course-participants] .course-participants-title': {
        ...theme.typography.subtitle2,
        textTransform: 'uppercase',
        color: theme.palette.text.secondary,
        margin: 0,
      },
    }),
  },
};

const eventCalendarOverrides: NonNullable<SchedulerComponents['MuiEventCalendar']> = {
  defaultProps: {
    dateLocale: appLocale,
    localeText: frFR.components.MuiEventCalendar.defaultProps.localeText,
  },
  styleOverrides: {
    headerToolbarLabel: { textTransform: 'capitalize' },
    dayTimeGridAllDayEventsGrid: { display: 'none' },
    content: { position: 'relative' },
  },
};

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: PRIMARY_MAIN,
    },
    background: {
      default: '#FDFCF8',
      paper: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          // Scoped to the calendar's loading dim: MUI's own menus render an
          // (invisible) backdrop that must stay untouched.
          '&.calendar-dim': {
            // Above the scheduler's event layer (z-index ≤ 4), below its popovers.
            zIndex: 5,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
          },
        },
      },
    },
    MuiCard,
    MuiDataGrid,
    MuiEventCalendar: eventCalendarOverrides,
    MuiEventDialog: eventDialogOverrides,
    MuiTableCell,
  },
};

export const theme = createTheme(themeOptions, baseTheme, muiAppLocale);
