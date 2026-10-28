"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ArrowRight, Menu, X } from "lucide-react";

import Fade from "@/components/animations/fade";
import FadeUpText from "@/components/animations/fade-up-text";
import Contact from "@/components/footer/contact";
import Logo from "@/components/header/logo";
// import SearchEvent from "@/components/header/search-event";
// import SignIn from "@/components/header/sign-in";
import SubmitEvent from "@/components/header/submit-event";
import LenisProvider from "@/components/providers/lenis-provider";
import Button from "@/components/ui/button";
import Drawer from "@/components/ui/drawer";
import { DEFAULT_CITY_SLUG, NAV, type Nav } from "@/constants/nav";
import { socials } from "@/constants/socials";
import { useAPI } from "@/hooks/use-api";
import { useCalendarToday } from "@/hooks/use-calendar-today";
import { useIsPathActive } from "@/hooks/use-is-path-active";
import { cn } from "@/lib/utils";
import type { Cities, CitySummary } from "@/requests/get-cities";

const instagram = socials.find((social) => social.name === "Instagram");

interface Props {
  className?: string;
}

const CITIES_ENDPOINT = `/api/public/cities?${new URLSearchParams({ page: "1", limit: "100" })}`;

export default function MobileMenu({ className }: Props) {
  const { data } = useAPI<Cities>(CITIES_ENDPOINT);
  const cities = data?.data ?? [];
  const pathname = usePathname();
  const { isPathActive } = useIsPathActive();

  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const isOpen = openedOn === pathname;

  const currentSlug = pathname.startsWith("/calendar/")
    ? decodeURIComponent(pathname.split("/")[2] ?? "")
    : undefined;
  const calendarCity =
    cities.find((city) => city.slug === currentSlug) ??
    cities.find((city) => city.slug === DEFAULT_CITY_SLUG) ??
    cities[0];

  const href = (item: Nav) =>
    item.pathId === "calendar" && calendarCity
      ? `/calendar/${calendarCity.slug}`
      : item.link;

  return (
    <Drawer.Root
      isOpen={isOpen}
      onOpenChange={(open) => setOpenedOn(open ? pathname : null)}
    >
      <Drawer.Trigger
        variant="outlineWhite"
        size="icon"
        aria-label="Open menu"
        className={cn("rounded-full border-inherit text-inherit", className)}
      >
        <Menu size={16} aria-hidden="true" />
      </Drawer.Trigger>
      <Drawer.Content
        aria-label="Menu"
        className="bg-red text-white shadow-none"
      >
        {(onClose) => (
          <>
            <Drawer.Header className="flex items-center justify-between gap-4 py-4">
              <Logo variant="white" className="w-50" />
              <div className="flex items-center gap-3">
                {/* <SearchEvent className="text-white" /> */}
                <Button
                  variant="onWhite"
                  size="icon"
                  onPress={onClose}
                  aria-label="Close menu"
                  className="rounded-full"
                >
                  <X size={16} aria-hidden="true" />
                </Button>
              </div>
            </Drawer.Header>

            <Drawer.Body className="flex flex-col gap-0 px-0! py-0">
              <LenisProvider>
                <nav aria-label="Main" className="px-pg-sm pt-6">
                  <ul className="flex flex-col">
                    {NAV.filter((item) => !item.isFooter).map((item, index) => {
                      const active = isPathActive(item.pathId);
                      return (
                        <li
                          key={item.pathId}
                          className="flex flex-col gap-3 border-t border-white/25 py-6"
                        >
                          <Link
                            href={href(item)}
                            aria-current={active ? "page" : undefined}
                            className="flex items-center gap-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                          >
                            {active && (
                              <span
                                aria-hidden="true"
                                className="size-4.5 shrink-0 animate-fade rounded-full bg-current animate-delay-300 animate-duration-500"
                              />
                            )}
                            <FadeUpText
                              as="div"
                              text={item.title}
                              delay={index * 0.1}
                              className="min-w-0 flex-1 font-montreal text-5xl tracking-mono uppercase"
                            />
                            <ArrowRight
                              size={22}
                              aria-hidden="true"
                              className="shrink-0"
                            />
                          </Link>

                          {item.pathId === "calendar" && calendarCity && (
                            <CalendarToday city={calendarCity} />
                          )}

                          {item.pathId === "cities" && cities.length > 0 && (
                            <ul
                              aria-label="Choose a city"
                              className="flex flex-wrap gap-1.5"
                            >
                              {cities.map((city, idx) => {
                                const current = city.slug === currentSlug;
                                return (
                                  <li key={city.id}>
                                    <Fade delay={idx * 0.1}>
                                      <Link
                                        href={`/calendar/${city.slug}`}
                                        aria-current={
                                          current ? "page" : undefined
                                        }
                                      >
                                        <Button
                                          variant={
                                            current ? "onWhite" : "outlineWhite"
                                          }
                                          className="rounded-full"
                                        >
                                          {city.name}
                                        </Button>
                                      </Link>
                                    </Fade>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="flex flex-col gap-2.5 border-t border-white/25 px-4 pt-5">
                  <SubmitEvent variant="ink" size="md" className="w-full" />
                  {/* <SignIn variant="outlineWhite" size="md" className="w-full" /> */}
                </div>

                <div className="flex items-start justify-between gap-4 px-4 pt-12 pb-6 font-courier text-xs tracking-cou uppercase">
                  <div className="flex items-center gap-2">
                    {instagram && (
                      <>
                        <Link
                          href={instagram.link}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Instagram (opens in a new tab)"
                        >
                          Instagram
                        </Link>
                        {" · "}
                      </>
                    )}
                    <Contact className="text-xs" />
                  </div>
                  <p className="text-white/60">FOLA Projects</p>
                </div>
              </LenisProvider>
            </Drawer.Body>
          </>
        )}
      </Drawer.Content>
    </Drawer.Root>
  );
}

function CalendarToday({ city }: { city?: CitySummary }) {
  const { totalEvents, cityName } = useCalendarToday({ city });

  return (
    <p className="font-courier text-xs tracking-cou text-cream uppercase">
      {cityName}
      {totalEvents !== undefined &&
        ` · ${totalEvents} ${totalEvents === 1 ? "happening" : "happenings"} today`}
    </p>
  );
}
