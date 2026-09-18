import { usePathname } from "next/navigation";

export const useIsPathActive = () => {
  const pathname = usePathname();
  const [, ...childPaths] = pathname.split("/");
  const pathIds = childPaths.join("/") || "/";

  const isPathActive = (pathId: string | readonly string[] | undefined): boolean => {
    const ids = typeof pathId === "string" ? [pathId] : pathId;
    return ids?.some((id) => Boolean(id) && pathIds.startsWith(id)) ?? false;
  };

  return { isPathActive };
};
