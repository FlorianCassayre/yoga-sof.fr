import { frFR as materialFrFR } from '@mui/material/locale';
import { frFR as dataGridFrFR } from '@mui/x-data-grid/locales';
import { frFR as pickersFrFR } from '@mui/x-date-pickers/locales';
import { fr } from 'date-fns/locale';

export const muiFrenchLocale = {
  components: {
    ...materialFrFR.components,
    ...dataGridFrFR.components,
    MuiLocalizationProvider: {
      defaultProps: {
        adapterLocale: fr,
        localeText: pickersFrFR,
      },
    },
  },
};
