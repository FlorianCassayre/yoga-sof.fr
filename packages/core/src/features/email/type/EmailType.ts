import type { emailTypeEnum } from './emailTypeEnum';

export type EmailType = (typeof emailTypeEnum.enumValues)[number];
