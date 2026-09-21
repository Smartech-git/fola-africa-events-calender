"use client";

import Link from "next/link";

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

      <div className="mt-8 w-full min-w-0 overflow-visible">
        <div className="grid w-full grid-cols-2 items-center gap-4 gap-x-1 overflow-visible sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {cities?.data?.map((item) => (
            <Link
              key={item.id}
              href={`/events/${item.slug}`}
              className="max-w-full min-w-0 self-start justify-self-center max-md:nth-[2n]:justify-self-end max-md:nth-[2n+1]:justify-self-start xs:max-w-none md:max-lg:nth-[3n]:justify-self-end md:max-lg:nth-[3n+1]:justify-self-start lg:nth-[5n]:justify-self-end lg:nth-[5n+1]:justify-self-start"
            >
              <Button
                onPress={() => handleParamSet("city", item.name)}
                variant="flat"
                size="fit"
                className={cn(
                  "max-w-full overflow-visible font-apris text-3xl font-medium max-xs:wrap-break-word max-xs:whitespace-normal xs:max-w-none xs:wrap-normal xs:whitespace-nowrap md:text-4xl lg:text-5xl",
                  getFilterValue(CITIES_ID_KEY) === item.slug && "text-primary",
                )}
              >
                <HoverText text={item.name} />
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
