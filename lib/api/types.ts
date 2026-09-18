export interface FetcherOptions {
  method?:
    | "GET"
    | "DELETE"
    | "HEAD"
    | "OPTIONS"
    | "POST"
    | "PUT"
    | "PATCH"
    | "PURGE"
    | "LINK"
    | "UNLINK";
  data?: any;
  customHeaders?: HeadersInit;
  baseUrl?: string;
  fetchOptions?: RequestInit;
  useAuth?: boolean;
  retry?: number;
  delay?: number;
  cookiesKey?: string;
  axiosConfig?: any;
}

export type Code =
  | 200
  | 201
  | 204
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 429
  | 500
  | 501
  | 503
  | "OK"
  | "ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INVALID"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

export interface BaseResponse {
  success: boolean;
  code?: Code;
  message: any;
  data?: any;
}

export type FetchFunction = <T = BaseResponse>(
  url: string,
  options: FetcherOptions,
) => Promise<T>;
