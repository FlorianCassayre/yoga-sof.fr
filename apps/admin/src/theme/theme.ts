import { createTheme, type Theme, type ThemeOptions } from '@mui/material';
import { frFR } from '@mui/x-scheduler/locales';
import type { SchedulerComponents } from '@mui/x-scheduler/theme-augmentation';
import { appLocale } from '@yoga-sof/core';
import { muiAppLocale } from '@yoga-sof/ui/muiAppLocale';
import { theme as baseTheme } from '@yoga-sof/ui/theme/theme';

import { MuiDataGrid } from './components/MuiDataGrid';

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
    miniCalendarDayButton: {
      position: 'relative',
      '&[data-has-events]::after': {
        content: '""',
        position: 'absolute',
        bottom: 3,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 4,
        height: 4,
        borderRadius: 999,
        backgroundColor: PRIMARY_MAIN,
      },
    },
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
    MuiDataGrid,
    MuiEventCalendar: eventCalendarOverrides,
    MuiEventDialog: eventDialogOverrides,
  },
};

export const theme = createTheme(themeOptions, baseTheme, muiAppLocale);
