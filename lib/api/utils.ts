export const baseUrl = process.env.BASE_URL;

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
