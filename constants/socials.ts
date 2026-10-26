import { FaInstagram } from "react-icons/fa";

export const CONTACT_EMAIL = "hello@happeningsofafrica.com";

export type Social = {
  link: string;
  name: string;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
};

export const socials: Social[] = [
  {
    link: "https://www.instagram.com/happeningsofafrica",
    name: "Instagram",
    Icon: FaInstagram,
  },
];
