import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import SectionWrapper from "@/components/layout/section-wrapper";
import { VISIBILITY_OPTIONS } from "@/payload/constants";

// An example private happening, as each listing option would show it.
const DATE = "Thu 12 Mar";
const TIME = "7:00 PM to 10:00 PM";
const INDUSTRY = "Business and Finance";

const PREVIEWS: Record<string, { title: string; lines: string[] }> = {
  public: {
    title: "Founders’ dinner",
    lines: [
      TIME,
      `Dinner · ${INDUSTRY}`,
      "Invitation only",
      "Organiser: Studio Ama",
    ],
  },
  industry: {
    title: "Founders’ dinner",
    lines: [TIME, INDUSTRY, "Invitation only"],
  },
  "held-date": {
    title: "Private Business event",
    lines: [TIME, INDUSTRY, "Private"],
  },
};

/** On the submit landing page: how a private happening can appear. */
export default function ListingOptions() {
  return (
    <section
      aria-labelledby="listing-options-heading"
      className="w-full bg-ink text-white"
    >
      <SectionWrapper className="gap-8">
        <SurTitle
          content="What should Happenings show?"
          className="text-cream"
        />
        <FadeUpText
          as="h2"
          id="listing-options-heading"
          text="Organisers decide how a private happening appears"
          className="font-montreal text-3xl font-medium tracking-mono md:text-5xl"
        />
        <ul className="grid gap-6 md:grid-cols-3">
          {VISIBILITY_OPTIONS.map((option) => {
            const preview = PREVIEWS[option.value];
            return (
              <li
                key={option.value}
                className="flex flex-col gap-3.5 bg-cream px-6 pt-6 pb-7 text-ink"
              >
                <SurTitle as="h3" content={option.label} />
                <p className="font-montreal text-base">{option.description}</p>
                <div className="flex flex-col gap-1 border-t border-ink/20 pt-4">
                  <p className="font-courier text-sm tracking-cou text-red uppercase">
                    {DATE}
                  </p>
                  <p className="font-montreal text-xl font-medium tracking-mono uppercase">
                    {preview.title}
                  </p>
                  {preview.lines.map((line) => (
                    <p key={line} className="font-courier text-[15px]">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </SectionWrapper>
    </section>
  );
}
