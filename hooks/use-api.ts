import useSWR, { SWRConfiguration, Key, BareFetcher } from "swr";

import { request } from "@/lib/api/request";
import { FetcherOptions } from "@/lib/api/types";

interface UseAPIOptions extends FetcherOptions, SWRConfiguration {}

type ArrayResponse<T> = T extends any[] ? T : T[];

export function useAPI<T>(endpoint: Key, options: UseAPIOptions = {}) {
  const {
    method,
    data,
    customHeaders,
    fetchOptions,
    useAuth,
    baseUrl,
    cookiesKey,
    retry,
    delay,
    ...swrOptions
  } = options;

  const fetcherOptions: FetcherOptions = {
    method,
    data,
    customHeaders,
    baseUrl,
    fetchOptions,
    useAuth,
    cookiesKey,
    retry,
    delay,
  };

  const fetcher: BareFetcher<T> = async (key: Key) => {
    const url = Array.isArray(key)
      ? key.join("/")
      : typeof key === "string"
        ? key
        : String(key);
    const response = await request<T>({
      endpoint: url,
      options: fetcherOptions,
    });
    // request() returns failures instead of throwing; surface them as SWR errors.
    if (
      response &&
      typeof response === "object" &&
      "success" in response &&
      response.success === false
    )
      throw Object.assign(
        new Error(
          typeof response.message === "string"
            ? response.message
            : "Request failed.",
        ),
        { status: "status" in response ? response.status : undefined },
      );
    return response as T;
  };

  const {
    data: response,
    error,
    mutate,
    isLoading,
  } = useSWR<T>(endpoint, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    ...swrOptions,
  });

  const addItem = (newItem: T extends any[] ? T[0] : T) => {
    mutate((currentData: T | undefined) => {
      if (!currentData) {
        return [newItem] as T;
      }
      const arrayData = (
        Array.isArray(currentData) ? currentData : []
      ) as ArrayResponse<T>;
      return [...arrayData, newItem] as T;
    }, false);
  };

  const removeItem = <Type>(id: Type) => {
    mutate((currentData: T | undefined) => {
      if (!currentData) {
        return [] as T;
      }
      const arrayData = (
        Array.isArray(currentData) ? currentData : []
      ) as ArrayResponse<T>;
      return arrayData.filter((item: any) => item.id !== id) as T;
    }, false);
  };

  const putItem = <Type>(
    id: Type,
    key: keyof (T extends any[] ? T[0] : T),
    value: any,
  ) => {
    mutate((currentData: T | undefined) => {
      if (!currentData) {
        return [] as T;
      }
      const arrayData = (
        Array.isArray(currentData) ? currentData : []
      ) as ArrayResponse<T>;
      return arrayData.map((item: any) =>
        item.id === id ? { ...item, [key]: value } : item,
      ) as T;
    }, false);
  };

  return {
    data: response,
    error,
    isLoading,
    mutate,
    addItem,
    removeItem,
    putItem,
  };
}
