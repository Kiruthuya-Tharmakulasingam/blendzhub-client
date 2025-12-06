export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
  error?: string;
  errors?: Record<string, string>;
}

