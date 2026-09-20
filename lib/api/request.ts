"use server";

import { FetchFunction } from "@/lib/api/types";
import { baseUrl, sleep } from "@/lib/api/utils";
import { getCookies } from "@/lib/cookies";

export const request: FetchFunction = async ({ endpoint = "", options }) => {
  const {
    method = "GET",
    data = null,
    customHeaders = {},
    fetchOptions = {},
    useAuth = false,
    retry = 3,
    delay = 10000,
  } = options;

  const isFormData = data instanceof FormData;
  const headers: Record<string, any> = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...customHeaders,
  };

  if (useAuth) {
    const authData = await getCookies();
    if (authData?.cookie.accessToken) {
      headers.Authorization = `Bearer ${authData.cookie.accessToken}`;
    }
  }

  const controller = new AbortController();
  const requestOptions: RequestInit = {
    method,
    headers,
    signal: controller.signal,
    ...fetchOptions,
  };

  if (data && method !== "GET") {
    requestOptions.body = isFormData ? data : JSON.stringify(data);
  }

  const requestBaseUrl = options.baseUrl || baseUrl;
  const fullUrl = endpoint
    ? new URL(endpoint, requestBaseUrl).toString()
    : requestBaseUrl;
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let attempts = 0;
  let lastError: Error;

  while (attempts <= retry) {
    try {
      const response = await fetch(fullUrl, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          message: errorData || "Something went wrong",
          success: false,
          status: response.status,
        };
      }
      return await response.json();
    } catch (error: any) {
      lastError = error as Error;
      attempts++;

      const isNetworkError =
        error instanceof TypeError ||
        error.message.includes("fetch") ||
        error.message.includes("aborted");
      const isServerError =
        "cause" in error &&
        typeof error.cause === "object" &&
        "status" in error.cause &&
        Number(error.cause.status) >= 500 &&
        Number(error.cause.status) <= 599;

      if (attempts > retry || (!isNetworkError && !isServerError)) {
        console.error(lastError);
        return {
          message:
            "Network error. Check your network connection, and try again.",
          success: false,
        };
      }

      console.warn(
        `Retrying ${endpoint} (${retry - attempts + 1} attempts left): ${lastError.message}`,
      );
      await sleep(delay * Math.pow(2, attempts - 1));
    }
  }

  console.error("Request failed after multiple retries:", lastError!);

  return {
    message: "Something went wrong, please try again.",
    success: false,
  };
};
