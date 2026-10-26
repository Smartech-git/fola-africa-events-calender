"use client";

import { useEffect, useState, type ReactNode } from "react";

import Link from "next/link";

import { Upload } from "lucide-react";

import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import SectionWrapper from "@/components/layout/section-wrapper";
import DateCircle from "@/components/ui/date-circle";
import { cn } from "@/lib/utils";

export const FORM_SECTIONS = [
  { id: "the-happening", title: "The Happening" },
  { id: "who-can-attend", title: "Who can attend?" },
  { id: "where", title: "Where is it happening?" },
  { id: "links", title: "Links and information" },
  // { id: "show-us", title: "Show us the Happening" },
  { id: "about-you", title: "About you" },
  { id: "what-to-show", title: "What should Happenings show?" },
] as const;

export type FormSectionId = (typeof FORM_SECTIONS)[number]["id"];

const number = (index: number) => String(index + 1).padStart(2, "0");

export function FormSection({
  id,
  intro,
  children,
}: {
  id: FormSectionId;
  intro?: string;
  children: ReactNode;
}) {
  const index = FORM_SECTIONS.findIndex((section) => section.id === id);
  const { title } = FORM_SECTIONS[index];

  return (
    <fieldset
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex min-w-0 first:pt-0 first:border-t-0 scroll-mt-32 flex-col gap-5 border-t-[1.5px] border-ink pt-10 pb-12"
    >
      <div className="flex items-center gap-4">
        <DateCircle size="sm">{number(index)}</DateCircle>
        <FadeUpText
          as="h2"
          id={`${id}-title`}
          text={title}
          className="font-montreal text-3xl font-medium tracking-mono uppercase sm:text-[44px]"
        />
      </div>
      {intro && <p className="font-montreal text-base sm:text-lg">{intro}</p>}
      {children}
    </fieldset>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-3 bg-cream px-4 py-3.5 font-montreal text-base">
      <span
        aria-hidden="true"
        className="mt-2 size-2.5 shrink-0 rounded-full bg-red"
      />
      <span>{children}</span>
    </p>
  );
}

export function ChoiceCard({
  type = "radio",
  name,
  value,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  type?: "radio" | "checkbox";
  name: string;
  value: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: string, checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3.5 border px-4.5 py-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-red",
        checked
          ? "border-2 border-red bg-cream px-4.25 py-3.75"
          : "border-ink/35 hover:border-ink",
        disabled && "cursor-not-allowed opacity-50 hover:border-ink/35",
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(value, event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-5 shrink-0 rounded-full border-[1.5px] transition-colors",
          checked ? "border-red bg-red" : "border-ink",
        )}
      />
      <span className="flex min-w-0 flex-col gap-1">
        <span
          className={cn(
            "font-courier text-sm tracking-cou uppercase",
            checked && "text-red",
          )}
        >
          {label}
        </span>
        <span className="font-montreal text-base">{description}</span>
      </span>
    </label>
  );
}

export function UploadBox({
  badge,
  badgeTone,
  title,
  description,
}: {
  badge: string;
  badgeTone: "red" | "ink";
  title: string;
  description: string;
}) {
  return (
    <div
      aria-disabled="true"
      className="flex flex-1 flex-col items-center gap-3 border-[1.5px] border-dashed border-ink/50 bg-white px-6 py-7 text-center"
    >
      <span
        className={cn(
          "px-2.5 py-1 font-courier text-[11px] tracking-cou text-white uppercase",
          badgeTone === "red" ? "bg-red" : "bg-ink",
        )}
      >
        {badge}
      </span>
      <Upload size={28} aria-hidden="true" className="text-ink/40" />
      <span className="font-courier text-sm tracking-cou text-red uppercase">
        {title}
      </span>
      <span className="font-montreal text-base">{description}</span>
      <span className="font-courier text-[11px] tracking-cou text-ink/60 uppercase">
        Uploads open soon
      </span>
    </div>
  );
}

/** The form section currently in view, shared by the desktop list and mobile bar. */
export function useActiveSection() {
  const [active, setActive] = useState<FormSectionId>(FORM_SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id as FormSectionId);
      },
      // A section counts as current while it crosses the upper middle of the screen.
      { rootMargin: "-35% 0px -60% 0px" },
    );
    for (const { id } of FORM_SECTIONS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return active;
}

/** Desktop: sticky list of sections; the circle fills for the section in view. */
export function SectionNav({ active }: { active: FormSectionId }) {
  return (
    <nav
      aria-label="Form sections"
      className="sticky top-28 flex flex-col gap-3 max-lg:hidden"
    >
      <span className="font-courier text-sm tracking-cou text-red uppercase">
        Sections
      </span>
      <ol className="flex flex-col">
        {FORM_SECTIONS.map((section, index) => {
          const current = section.id === active;
          return (
            <li key={section.id} className="border-b border-ink/20">
              <Link
                href={`#${section.id}`}
                aria-current={current ? "step" : undefined}
                className="flex items-center gap-3.5 py-3.5 focus-visible:outline-2 focus-visible:outline-red"
              >
                <DateCircle
                  size="sm"
                  variant={current ? "filled" : "outline"}
                  className="transition-colors"
                >
                  {number(index)}
                </DateCircle>
                <span
                  className={cn(
                    "font-courier text-sm tracking-cou uppercase",
                    current ? "text-red" : "text-ink",
                  )}
                >
                  {section.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


export function SectionProgress({ active }: { active: FormSectionId }) {
  const index = FORM_SECTIONS.findIndex((section) => section.id === active);

  return (
    <nav
      aria-label="Form sections"
      className="sticky top-sm-header z-40 flex w-full items-center justify-between border-b-[1.5px] border-ink bg-white px-pg-sm py-4 sm:top-header sm:px-pg lg:hidden"
    >
      <ol className="flex items-center">
        {FORM_SECTIONS.map((section, sectionIndex) => {
          const current = section.id === active;
          return (
            <li key={section.id}>
              {/* Padding gives each small dot a usable tap target. */}
              <Link
                href={`#${section.id}`}
                aria-label={`Section ${sectionIndex + 1}: ${section.title}`}
                aria-current={current ? "step" : undefined}
                className="flex p-[3px] focus-visible:outline-2 focus-visible:outline-red"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2.5 rounded-full border-[1.5px] border-red transition-colors",
                    current ? "bg-red" : "bg-transparent",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ol>
      <span
        aria-live="polite"
        className="font-courier text-sm tracking-cou text-red uppercase"
      >
        Section {index + 1} of {FORM_SECTIONS.length}
      </span>
    </nav>
  );
}

export function FormHeader({ header }: { header: ReactNode }) {
  return (
    <div className="relative z-60 flex w-full flex-col bg-red text-white">
      {header}
      <SectionWrapper className="gap-4">
        <SurTitle dot content="Submit a happening" className="text-white" />
        <FadeUpText
          as="h1"
          text="Tell us what’s happening."
          delay={0.1}
          className="font-montreal text-5xl font-medium tracking-mono sm:text-[80px]"
        />
        <FadeUpText
          text="Every submission is reviewed before appearing on the calendar. Listings are reviewed within two working days."
          delay={0.2}
          className="max-w-190 font-montreal text-lg text-cream sm:text-[22px]"
        />
      </SectionWrapper>
    </div>
  );
}
