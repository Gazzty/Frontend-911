export interface ApiResponse<T = null> {
  success: boolean;
  errors: string[] | null;
  warning?: string[];
  payload?: T;
}