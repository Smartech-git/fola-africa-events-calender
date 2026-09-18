import { FaInstagram, FaLinkedinIn } from "react-icons/fa";

export const BUSINESS_EMAIL = "work@folapr.com";

export const ENQUIRY_EMAIL = "hello@folapr.com";

export type Social = {
  link: string;
  name: string;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
};

export const socials: Social[] = [
  {
    link: "https://www.instagram.com/wewantfola",
    name: "Instagram",
    Icon: FaInstagram,
  },
  {
    link: "https://www.linkedin.com/company/fola-pr",
    name: "LinkedIn",
    Icon: FaLinkedinIn,
  },
];
