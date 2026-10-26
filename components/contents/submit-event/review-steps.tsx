"use client";

import FadeUpText from "@/components/animations/fade-up-text";
import DateCircle from "@/components/ui/date-circle";

export const REVIEW_STEPS = [
  {
    title: "Submitted",
    description: "We receive your happening and check the details.",
  },
  {
    title: "Approved",
    description: "The Happenings team reviews and approves the listing.",
  },
  {
    title: "Live",
    description: "It appears on the calendar for the city.",
  },
];

interface Props {
  done?: number;
}

export default function ReviewSteps({ done = 1 }: Props) {
  return (
    <ol className="grid w-full gap-8 md:grid-cols-3 md:gap-0">
      {REVIEW_STEPS.map((step, index) => {
        const last = index === REVIEW_STEPS.length - 1;
        return (
          <li
            key={step.title}
            aria-current={index === done - 1 ? "step" : undefined}
            className="flex min-w-0 flex-col gap-4 sm:gap-6"
          >
            <div className="flex w-full items-center">
              <DateCircle variant={index < done ? "filled" : "outline"}>
                {String(index + 1).padStart(2, "0")}
              </DateCircle>
              {!last && (
                <span
                  aria-hidden="true"
                  className="h-[1.5px] flex-1 bg-red max-md:hidden"
                />
              )}
            </div>

            <div className="flex flex-col gap-2 sm:pr-6">
              <FadeUpText
                as="h3"
                text={step.title}
                delay={index * 0.1}
                className="text-4xl font-montreal font-medium tracking-cou text-red uppercase sm:text-5xl"
              />
              <FadeUpText
                text={step.description}
                delay={0.1 + index * 0.1}
                className="font-montreal text-xl sm:text-2xl"
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
