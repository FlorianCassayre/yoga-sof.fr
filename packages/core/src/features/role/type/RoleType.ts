import type { roleTypeEnum } from './roleTypeEnum';

export type RoleType = (typeof roleTypeEnum.enumValues)[number];
