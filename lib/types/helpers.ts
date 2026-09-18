type FormValue<T> = T extends true ? "on" : T extends false ? "off" : T;
export class TypedFormData<T extends Record<string, unknown>> {
  constructor(private formData: FormData) {}

  get<K extends keyof T>(key: K): FormValue<T[K]> | null {
    return this.formData.get(key as string) as FormValue<T[K]> | null;
  }
}
