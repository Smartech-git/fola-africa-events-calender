import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import SectionWrapper from "@/components/layout/section-wrapper";

const EASIER = [
  { verb: "Discover", what: "What’s happening" },
  { verb: "Share", what: "Opportunities" },
  {
    verb: "Stay connected",
    what: "To activity beyond familiar networks and markets",
  },
];

export default function OnePlace() {
  return (
    <section
      aria-labelledby="about-calendar"
      className="w-full bg-cream text-ink"
    >
      <SectionWrapper className="gap-12 sm:gap-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-40">
          <SurTitle
            as="h2"
            id="about-calendar"
            content="The calendar"
            className="lg:w-75 lg:shrink-0"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-7">
            <FadeUpText
              text="A shared events calendar connecting the business, cultural and social activity shaping African cities"
              className="font-montreal text-3xl font-medium tracking-mono sm:text-5xl"
            />
            <FadeUpText
              text="The platform brings events across industries into one accessible place. It makes it easier to discover what’s happening, share opportunities and stay connected to activity beyond familiar networks and markets."
              delay={0.1}
              className="max-w-190 font-montreal text-xl sm:text-2xl"
            />
          </div>
        </div>

        <ol
          aria-label="What Happenings makes easier"
          className="grid gap-px bg-ink/25 sm:grid-cols-3"
        >
          {EASIER.map(({ verb, what }, index) => (
            <li
              key={verb}
              className="flex flex-col justify-between gap-4 bg-cream py-6 sm:min-h-72 sm:gap-10 sm:px-6 sm:first:pl-0"
            >
              <span className="font-courier text-xs tracking-cou text-red uppercase sm:text-sm">
                {String(index + 1).padStart(2, "0")} · {verb}
              </span>
              <FadeUpText
                text={what}
                delay={index * 0.1}
                className="font-montreal text-2xl font-medium tracking-mono uppercase sm:text-3xl"
              />
            </li>
          ))}
        </ol>
      </SectionWrapper>
    </section>
  );
}
