export type Nav = {
  title: string;
  link: string;
  pathId: string;
  isFooter?: boolean;
};

export const DEFAULT_CITY_SLUG = "lagos";
export const DEFAULT_CITY_TIMEZONE = "Africa/Lagos";
export const DEFAULT_CITY_NAME = "Lagos";

export const NAV: Nav[] = [
  {
    title: "Calendar",
    link: `/calendar/${DEFAULT_CITY_SLUG}`,
    pathId: "calendar",
  },
  {
    title: "Cities",
    link: "/cities",
    pathId: "cities",
  },
  {
    title: "About",
    link: "/about",
    pathId: "about",
  },
  {
    title: "Submit a Happening",
    link: "/submit-event",
    pathId: "submit-event",
    isFooter: true,
  },
];
