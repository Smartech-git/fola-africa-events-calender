"use client";

import React from "react";

import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { CITIES_ID_KEY } from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import { cn } from "@/lib/utils";
import type { Cities as CitiesType } from "@/requests/get-cities";

interface Props {
  cities: CitiesType;
}

export default function Cities({ cities }: Props) {
  const { getFilterValue, handleParamSet } = useRouteParam([
    { key: CITIES_ID_KEY, value: cities.data[0].slug },
  ]);

  return (
    <SectionWrapper className="py-8">
      <div className="group w-fit text-xs uppercase">
        <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
          [
        </span>
        Select a city
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
          ]
        </span>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
        {cities?.data?.map((item) => (
          <Button
            onPress={() => handleParamSet("city", item.name)}
            key={item.id}
            variant="flat"
            size="fit"
            className={cn(
              "justify-self-center font-apris text-4xl font-medium max-md:nth-[2n]:justify-self-end max-md:nth-[2n+1]:justify-self-start md:text-4xl md:max-lg:nth-[3n]:justify-self-end md:max-lg:nth-[3n+1]:justify-self-start lg:text-5xl lg:nth-[5n]:justify-self-end lg:nth-[5n+1]:justify-self-start",
              getFilterValue(CITIES_ID_KEY) === item.slug && "text-primary",
            )}
          >
            <HoverText text={item.name} />
          </Button>
        ))}
      </div>
    </SectionWrapper>
  );
}
