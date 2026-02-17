import { CourseType } from '@prisma/client';

export const IS_REGISTRATION_DISABLED = false;

export const WEBSITE_URL = 'https://yoga-sof.fr';

// eslint-disable-next-line no-useless-concat
export const EMAIL_CONTACT = 'contact' + '@' + 'yoga-sof.fr';

export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/Yoga-Sof-102478218061902';

export const COMETE_URL = 'https://www.lacometehesingue.fr/activites/yoga-pour-enfants';

export const INSTAGRAM_URL = 'https://www.instagram.com/yogasof.hesingue';

export const LINKEDIN_URL = 'https://www.linkedin.com/company/102190228/';

interface Location {
  name: string;
  coordinates: { latitude: number, longitude: number };
  googleUrl: string;
}

export const LocationHome = {
  name: '8 rue des moissonneurs, Hésingue',
  coordinates: { latitude: 47.576129, longitude: 7.514619 },
  googleUrl: 'https://goo.gl/maps/JABpGJXFrWM5NZUt7',
};
export const LocationComete = {
  name: 'La Comète, Hésingue',
  coordinates: { latitude: 47.580615, longitude: 7.520265 },
  googleUrl: 'https://g.page/Lacometehesingue',
};

export const CourseTypeLocation: Record<CourseType, Location> = {
  [CourseType.YOGA_ADULT]: LocationHome,
  [CourseType.YOGA_CHILD]: LocationHome,
  [CourseType.YOGA_ADULT_CHILD]: LocationComete,
};
