"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import { LoaderCircle, MapPin } from "lucide-react";

import Select from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CitySummary } from "@/requests/get-cities";

interface Props {
  cities: CitySummary[];
  value: string;
  className?: string;
}

export default function CitySwitcher({ cities, value, className }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      aria-label="Change city"
      placeholder="Change city"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        if (keys === "all") return;
        const slug = Array.from(keys)[0];
        if (typeof slug !== "string" || slug === value) return;
        startTransition(() =>
          router.push(`/calendar/${encodeURIComponent(slug)}`),
        );
      }}
      {...(isPending && {
        selectorIcon: (
          <span role="status" aria-label="Loading city">
            <LoaderCircle
              size={14}
              aria-hidden="true"
              className="size-full animate-spin"
            />
          </span>
        ),
      })}
      startContent={
        <MapPin size={18} aria-hidden="true" className="shrink-0 text-red" />
      }
      options={cities.map((city) => ({ label: city.name, value: city.slug }))}
      className={cn("w-full sm:w-60", className)}
      classNames={{
        trigger:
          "h-[38px] min-h-[38px] border-ink bg-cream! data-[hover=true]:border-red",
        value: "font-courier text-sm! tracking-cou uppercase sm:text-sm!",
      }}
    />
  );
}
