// =============================================================================
// Central type re-exports
// =============================================================================

export type * from "./product";
export type * from "./cart";
export type * from "./order";
export type * from "./user";

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Generic API error response */
export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

/** Generic paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
