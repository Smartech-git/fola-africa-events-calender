export const baseUrl = new URL("/", process.env.BASE_URL).toString();

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
