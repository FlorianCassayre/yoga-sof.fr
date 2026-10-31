import { frFR as materialFrFR } from '@mui/material/locale';
import { frFR as dataGridFrFR } from '@mui/x-data-grid/locales';
import { frFR as pickersFrFR } from '@mui/x-date-pickers/locales';
import { appLocale } from '@yoga-sof/core';

export const muiAppLocale = {
  components: {
    ...materialFrFR.components,
    ...dataGridFrFR.components,
    MuiLocalizationProvider: {
      defaultProps: {
        adapterLocale: appLocale,
        localeText: pickersFrFR,
      },
    },
  },
};
