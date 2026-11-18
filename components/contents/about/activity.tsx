import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import SectionWrapper from "@/components/layout/section-wrapper";

// What is happening across the cities, read as one running list.
const KINDS = [
  { kind: "Business gatherings", field: "Business" },
  { kind: "Industry conferences", field: "Industry" },
  { kind: "Art exhibitions", field: "Art" },
  { kind: "Music festivals", field: "Music" },
  { kind: "Cultural experiences", field: "Culture" },
];

export default function Activity() {
  return (
    <section
      aria-labelledby="about-activity"
      className="w-full bg-cream text-ink"
    >
      <SectionWrapper className="gap-10 lg:flex-row lg:gap-40">
        <SurTitle
          as="h2"
          id="about-activity"
          content="The activity"
          className="lg:w-75 lg:shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          <p className="sr-only">
            From business gatherings and industry conferences to art
            exhibitions, music festivals and cultural experiences, our cities
            are alive with activity.
          </p>
          <ul aria-hidden="true" className="flex flex-col">
            {KINDS.map(({ kind, field }, index) => (
              <li
                key={kind}
                className="group/kind flex items-baseline justify-between gap-6 border-t border-ink/25 py-4 last:border-b sm:py-5"
              >
                <FadeUpText
                  text={kind}
                  delay={index * 0.06}
                  className="font-montreal text-3xl font-medium tracking-mono uppercase transition-colors duration-300 group-hover/kind:text-red sm:text-5xl xl:text-6xl"
                />
                <span className="shrink-0 font-courier text-xs tracking-cou text-ink/60 uppercase sm:text-sm">
                  {field}
                </span>
              </li>
            ))}
          </ul>
          <FadeUpText
            text="Our cities are alive with activity."
            className="font-montreal text-2xl sm:text-3xl"
          />
        </div>
      </SectionWrapper>
    </section>
  );
}
