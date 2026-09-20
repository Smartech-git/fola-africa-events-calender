import React from "react";

import HoverText from "@/components/animations/hover-text";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import type { Cities as CitiesType } from "@/requests/get-cities";

interface Props {
  cities: CitiesType;
}

export default function Cities({ cities }: Props) {
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
        {cities?.data?.map((item, idx) => (
          <Button
            key={item.id}
            variant="flat"
            size="fit"
            className="ustify-self-center font-apris text-3xl font-medium max-md:nth-[2n]:justify-self-end max-md:nth-[2n+1]:justify-self-start md:text-4xl md:max-lg:nth-[3n]:justify-self-end md:max-lg:nth-[3n+1]:justify-self-start lg:text-5xl lg:nth-[5n]:justify-self-end lg:nth-[5n+1]:justify-self-start"
          >
            <HoverText delay={idx * 0.1} inView text={item.name} />
          </Button>
        ))}
      </div>
    </SectionWrapper>
  );
}
