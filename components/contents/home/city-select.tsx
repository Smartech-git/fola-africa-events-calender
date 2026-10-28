"use client";

import { MapPin } from "lucide-react";

import Select from "@/components/ui/select";
import { FILTER_KEYS } from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import { cn } from "@/lib/utils";
import type { CitySummary } from "@/requests/get-cities";

interface Props {
  cities: CitySummary[];
  value: string;
  className?: string;
}

export default function CitySelect({ cities, value, className }: Props) {
  const { handleParamSet } = useRouteParam();

  return (
    <Select
      aria-label="Choose a city"
      placeholder="Choose a city"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        if (keys === "all") return;
        const slug = Array.from(keys)[0];
        if (typeof slug !== "string" || slug === value) return;
        document.cookie = `${FILTER_KEYS.siteCity}=${encodeURIComponent(slug)}; path=/; max-age=31536000; samesite=lax`;
        handleParamSet({
          [FILTER_KEYS.siteCity]: slug,
          [FILTER_KEYS.homeDate]: undefined,
        });
      }}
      startContent={
        <MapPin size={18} aria-hidden="true" className="shrink-0" />
      }
      options={cities.map((city) => ({ label: city.name, value: city.slug }))}
      className={cn("w-full sm:w-60", className)}
      classNames={{
        trigger:
          "h-12 min-h-12 border-[1.5px] border-white bg-transparent! text-white data-[hover=true]:border-cream data-[open=true]:border-cream group-data-[focus=true]:border-cream data-[focus-visible=true]:outline-white",
        value:
          "font-courier text-sm! tracking-cou text-white! uppercase sm:text-sm! group-data-[has-value=false]:text-white/70!",
        selectorIcon: "text-white",
      }}
    />
  );
}
