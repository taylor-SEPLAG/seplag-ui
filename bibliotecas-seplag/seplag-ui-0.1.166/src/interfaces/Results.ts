export interface ResultsSeplag<T> {
  content: T[];
  pageable?: PageableSeplag;
  last: boolean;
  totalPages: number;
  pageActual: number;
  sizePage: number;
  totalRecords: number;
  size: number;
  number: number;
  sort?: SortSeplag;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface PageableSeplag {
  sort: SortSeplag;
  offset: number;
  pageSize: number;
  pageNumber: number;
  unpaged: boolean;
  paged: boolean;
}

export interface SortSeplag {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}
