export interface Paginated<T> {
  /**
   * 0-indexed page number
   */
  page: number;
  totalPages: number;
  elementsPerPage: number;
  totalElements: number;
  data: T[];
}

export interface Pagination {
  page: number;
  elementsPerPage: number;
}
