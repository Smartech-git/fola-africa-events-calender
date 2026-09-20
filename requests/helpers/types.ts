export type RequestOptions = {
  endpoint?: string;
  page?: number;
  limit?: number;
};

export type ErrorResponse = {
  errors?: { message: string }[];
};
