import {
  Coupon,
  CouponModel,
  Course,
  CourseModel,
  Membership,
  MembershipModel,
  Transaction,
  User
} from '@prisma/client';
import { CourseTypeNames } from './course';
import {
  formatColonTimeHHhMM, formatDateDDsMMsYYYY,
  formatDateDDsmmYYYY,
  formatTimeHHhMM,
  formatWeekday,
  WeekdayNames
} from './date';
import { MembershipTypeNames } from './membership';

export const displayCourseName = ({ type, dateStart, dateEnd }: Pick<Course, 'type' | 'dateStart' | 'dateEnd'>, capitalize = true) => [
  capitalize ? 'Séance' : 'séance',
  CourseTypeNames[type].toLowerCase(),
  'du',
  formatWeekday(dateStart, false),
  formatDateDDsmmYYYY(dateStart),
  'de',
  formatTimeHHhMM(dateStart),
  'à',
  formatTimeHHhMM(dateEnd),
].join(' ');
//formatDayRange(dateStart, dateEnd, false),

export const displayCourseModelName = ({ type, weekday, timeStart, timeEnd, bundle }: CourseModel, capitalize = true) => [
  capitalize ? CourseTypeNames[type] : CourseTypeNames[type].toLowerCase(),
  'le',
  WeekdayNames[weekday].toLowerCase(),
  'de',
  formatColonTimeHHhMM(timeStart),
  'à',
  formatColonTimeHHhMM(timeEnd),
].concat(bundle ? ['(lot)'] : []).join(' ');

/*export const displayDateOnly = date => format(new Date(date), dateFormat);

export const displayDatetime = date => formatTimestamp(date);*/

/*export const displayTimePeriod = (dateStart: ConstructorParameters<typeof Date>[0], dateEnd: ConstructorParameters<typeof Date>[0]) => [
  format(new Date(dateStart), `HH'h'mm`),
  'à',
  format(new Date(dateEnd), `HH'h'mm`),
].join(' ');*/

export const displayUserName = ({ customName, name, customEmail, email, id }: Pick<User, 'customName' | 'name' | 'customEmail' | 'email' | 'id'>) =>
  customName || name || customEmail || email || `#${id}`;

export const displayUserEmail = ({ customEmail, email }: Pick<User, 'customEmail' | 'email'>) =>
  customEmail || email;

export const displayTransactionWithUserName = ({ amount, user }: Pick<Transaction, 'amount'> & { user: Parameters<typeof displayUserName>[0] }) =>
  `${amount} € de l'utilisateur ${displayUserName(user)}`;

export const displayTransactionWithDate = ({ amount, date, comment }: Pick<Transaction, 'amount' | 'date' | 'comment'>) =>
  `${amount} € du ${formatDateDDsmmYYYY(date)} (${comment})`;

export const displayCouponModelName = ({ courseType, quantity }: Pick<CouponModel, 'courseType' | 'quantity'>) => `Carte de ${quantity} séance${quantity > 1 ? 's' : ''} ${CourseTypeNames[courseType]}`;

export const displayCouponName = ({ courseType, quantity }: Pick<Coupon, 'courseType' | 'quantity'>, capitalize = true) => `${capitalize ? 'Carte' : 'carte'} de ${quantity} séance${quantity > 1 ? 's' : ''} ${CourseTypeNames[courseType]}`;

export const displayMembershipModelName = ({ id: type, price }: Pick<MembershipModel, 'id' | 'price'>) => `${MembershipTypeNames[type]} (${price} €)`;

export const displayMembershipName = ({ type, dateStart, dateEnd }: Pick<Membership, 'type' | 'dateStart' | 'dateEnd'>, capitalize = true) =>
  `${capitalize ? 'Adhésion' : 'adhésion'} ${MembershipTypeNames[type].toLowerCase()} du ${formatDateDDsMMsYYYY(dateStart)} au ${formatDateDDsMMsYYYY(dateEnd)}`;
