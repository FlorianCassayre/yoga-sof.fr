import { Paginated, Pagination } from './types';

export const createPrismaPagination = (pagination: Pagination) =>
  ({ skip: pagination.page * pagination.elementsPerPage, take: pagination.elementsPerPage });

export const createPaginated = <T>(args: { page: number, elementsPerPage: number, totalElements: number, data: T[] }): Paginated<T> => ({
  ...args,
  totalPages: (args.totalElements + args.elementsPerPage - 1) / args.elementsPerPage,
});
