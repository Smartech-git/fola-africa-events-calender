import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn, DefaultValues } from "react-hook-form";
import * as z from "zod";

/**
 * A custom hook that combines React Hook Form with Zod schema validation
 * @param formSchema - The Zod schema to validate the form against
 * @param defaultValues - Optional default values for the form fields (must match the schema's input shape)
 * @returns A React Hook Form instance with Zod validation
 */
const useReactHookForm = <T extends z.ZodType<any, any, any>>(
  formSchema: T,
  defaultValues?: DefaultValues<z.input<T>>,
): UseFormReturn<z.input<T>, any, z.output<T>> =>
  useForm<z.input<T>, any, z.output<T>>({
    defaultValues,
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
  });

export default useReactHookForm;
