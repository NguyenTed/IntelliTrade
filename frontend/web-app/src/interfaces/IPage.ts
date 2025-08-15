export type PageResponse<T> = {
  content: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type NewsQuery = {
  page?: number;
  size?: number;
  q?: string;
  tags?: string[];
};
