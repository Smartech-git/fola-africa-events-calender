export type Nav =
  | {
      isMultiple?: false;
      title: string;
      link: string;
      pathId: string;
      paths?: never;
    }
  | {
      isMultiple: true;
      title: string;
      paths: Nav[];
    };

export const NAV: Nav[] = [
  {
    title: "About",
    link: "/about-us",
    pathId: "about-us",
  },
  {
    title: "Journal",
    link: "/journal",
    pathId: "journal",
  },
  {
    isMultiple: true,
    title: "Services",
    paths: [
      {
        title: "Services",
        link: "/services",
        pathId: "services",
      },
      {
        title: "Studio fola",
        link: "/studio-fola",
        pathId: "studio-fola",
      },
    ],
  },
  {
    title: "Contact",
    link: "/contact",
    pathId: "contact",
  },
];
