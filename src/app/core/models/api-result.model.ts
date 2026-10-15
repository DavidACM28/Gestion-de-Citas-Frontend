export interface ApiResult<T = unknown> {
  value?: T | null;
  isSuccess: boolean;
  isFailure: boolean;
  message: string | null;
  errors: string[];
}
