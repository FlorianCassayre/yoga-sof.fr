import { YOGA_ADULT, YOGA_ADULT_CHILD, YOGA_CHILD } from './courses';

export const IS_REGISTRATION_DISABLED = false;

// eslint-disable-next-line no-useless-concat
export const EMAIL_CONTACT = 'contact' + '@' + 'yoga-sof.fr';

export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/Yoga-Sof-102478218061902';

export const COMETE_URL = 'https://www.lacometehesingue.fr/les-associations/yoga-sof';

export const LOCATION_HOME = {
  name: '8 rue des moissonneurs, Hésingue',
  coordinates: { latitude: 47.576129, longitude: 7.514619 },
};
export const LOCATION_COMETE = {
  name: 'La Comète, Hésingue',
  coordinates: { latitude: 47.580615, longitude: 7.520265 },
};

export const COURSE_TYPE_LOCATION = {
  [YOGA_ADULT]: LOCATION_HOME,
  [YOGA_CHILD]: LOCATION_HOME,
  [YOGA_ADULT_CHILD]: LOCATION_COMETE,
};
