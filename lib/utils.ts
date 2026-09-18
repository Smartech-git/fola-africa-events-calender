import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (
  value: number | string,
  useToFixed: boolean = false,
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0";

  const strNum = useToFixed ? num.toFixed(2) : String(num);
  return strNum.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * @template T - The type of the input object, where keys are strings and values are stringifiable.
 * @param data - The object to convert into FormData.
 * @returns A FormData instance containing the key-value pairs from the input object.
 */
export const createFormData = <
  T extends Record<string, string | number | boolean | null | File | undefined>,
>(
  data: T,
): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value instanceof File ? value : String(value));
    }
  });

  return formData;
};

export const capitalizeString = (handle: string): string => {
  return handle
    ?.split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
};

export const toRgbaWithAlpha = (hex: string, alpha: number = 0.3): string => {
  let hexCol = hex.replace("#", "");
  // Expand shorthand form (e.g. "03F") to full form ("0033FF")
  if (hexCol.length === 3) {
    hexCol = hexCol
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hexCol.length === 8) {
    hexCol = hexCol.slice(0, 6);
  }
  const num = parseInt(hexCol, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
