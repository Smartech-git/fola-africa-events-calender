"use client";

import { useCallback, useEffect } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type DefaultParam = {
  key: string;
  value: string | string[];
};

export type KeyValuePairs = Record<string, string | undefined | string[]>;

export const useRouteParam = (defaultParams?: DefaultParam[]) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateUrl = useCallback(
    (params: URLSearchParams, path: string = pathname) => {
      const queryString = params.toString();
      const url = queryString ? `${path}?${queryString}` : path;
      router.replace(url, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  useEffect(() => {
    if (!defaultParams || defaultParams.length === 0) return;

    let shouldUpdateUrl = false;
    const params = new URLSearchParams(searchParams.toString());

    defaultParams.forEach(({ key, value }) => {
      if (params.has(key)) return;

      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }

      shouldUpdateUrl = true;
    });

    if (shouldUpdateUrl) {
      updateUrl(params);
    }
  }, [searchParams, defaultParams, updateUrl]);

  const getFilterValue = (key: string): string | undefined =>
    searchParams.get(key) || undefined;

  const getFilterValues = (key: string): string[] => searchParams.getAll(key);

  const handleParamSet = (
    keyOrPairs: string | KeyValuePairs,
    value?: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (typeof keyOrPairs === "string" && value !== undefined) {
      const key = keyOrPairs;
      params.delete(key);
      params.set(key, value);
    } else if (typeof keyOrPairs === "object" && value === undefined) {
      for (const [key, val] of Object.entries(keyOrPairs)) {
        params.delete(key);
        if (Array.isArray(val)) {
          val.forEach((v) => params.append(key, v));
        } else {
          if (val) {
            params.set(key, val);
          }
        }
      }
    } else {
      throw new Error(
        "handleParamSet requires either (key, value) or (object of key/value pairs)",
      );
    }

    updateUrl(params);
  };

  const handleParamAdd = (
    keyOrPairs: string | KeyValuePairs,
    value?: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (typeof keyOrPairs === "string" && value !== undefined) {
      const key = keyOrPairs;
      if (!params.getAll(key).includes(value)) {
        params.append(key, value);
      }
    } else if (typeof keyOrPairs === "object" && value === undefined) {
      for (const [key, val] of Object.entries(keyOrPairs)) {
        if (Array.isArray(val)) {
          val.forEach((v) => {
            if (!params.getAll(key).includes(v)) {
              params.append(key, v);
            }
          });
        } else {
          if (!params.getAll(key).includes(val as string)) {
            params.append(key, val as string);
          }
        }
      }
    } else {
      throw new Error(
        "handleParamAdd requires either (key, value) or (object of key/value pairs)",
      );
    }

    updateUrl(params);
  };

  const handleParamRemove = (
    keyOrPairs: string | KeyValuePairs,
    value?: string,
  ) => {
    if (typeof keyOrPairs === "string" && value !== undefined) {
      const key = keyOrPairs;
      const currentValues = searchParams.getAll(key);

      if (!currentValues.includes(value)) {
        return;
      }

      const params = new URLSearchParams();

      for (const [paramKey, paramValue] of searchParams.entries()) {
        if (paramKey !== key) {
          params.append(paramKey, paramValue);
        }
      }

      currentValues
        .filter((v) => v !== value)
        .forEach((v) => params.append(key, v));

      updateUrl(params);
    } else if (typeof keyOrPairs === "object" && value === undefined) {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(keyOrPairs)) {
        const currentValues = params.getAll(key);
        if (Array.isArray(val)) {
          val.forEach((v) => {
            if (currentValues.includes(v)) {
              const filtered = currentValues.filter((curr) => curr !== v);
              params.delete(key);
              filtered.forEach((remain) => params.append(key, remain));
            }
          });
        } else {
          if (currentValues.includes(val as string)) {
            const filtered = currentValues.filter((curr) => curr !== val);
            params.delete(key);
            filtered.forEach((remain) => params.append(key, remain));
          }
        }
      }
      updateUrl(params);
    } else {
      throw new Error(
        "handleParamRemove requires either (key, value) or (object of key/value pairs)",
      );
    }
  };

  const handleParamToggle = (
    keyOrPairs: string | KeyValuePairs,
    value?: string,
  ) => {
    if (typeof keyOrPairs === "string" && value !== undefined) {
      const key = keyOrPairs;
      const values = searchParams.getAll(key);

      if (values.includes(value)) {
        handleParamRemove(key, value);
      } else {
        handleParamAdd(key, value);
      }
    } else if (typeof keyOrPairs === "object" && value === undefined) {
      for (const [key, val] of Object.entries(keyOrPairs)) {
        if (Array.isArray(val)) {
          val.forEach((v) => {
            const values = searchParams.getAll(key);
            if (values.includes(v)) {
              handleParamRemove(key, v);
            } else {
              handleParamAdd(key, v);
            }
          });
        } else {
          if (hasParam(key, val as string)) {
            handleParamRemove(key, val);
          } else {
            handleParamAdd(key, val);
          }
        }
      }
    } else {
      throw new Error(
        "handleParamToggle requires either (key, value) or (object of key/value pairs)",
      );
    }
  };

  const hasParam = (key: string, value: string): boolean => {
    return searchParams.getAll(key).includes(value);
  };

  const clearParam = (keyOrKeys: string | string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (Array.isArray(keyOrKeys)) {
      keyOrKeys.forEach((key) => params.delete(key));
    } else {
      params.delete(keyOrKeys);
    }
    updateUrl(params);
  };

  return {
    getFilterValue,
    handleParamSet,
    getFilterValues,
    handleParamAdd,
    handleParamRemove,
    handleParamToggle,
    hasParam,
    clearParam,
    updateUrl,
  };
};
