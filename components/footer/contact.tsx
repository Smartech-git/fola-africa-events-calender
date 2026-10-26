import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import Button, { type ButtonProps } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/constants/socials";
import { cn } from "@/lib/utils";

interface Props extends ButtonProps {
  className?: string;
  label?: string;
}

export default function Contact({
  className,
  variant = "flat",
  size = "fit",
  ...rest
}: Props) {
  return (
    <Link
      href={`mailto:${CONTACT_EMAIL}`}
      aria-label={`Email ${CONTACT_EMAIL}`}
      className="w-fit has-[.hidden]:hidden"
    >
      <Button
        className={cn("text-inherit", className)}
        variant={variant}
        size={size}
        {...rest}
      >
        <HoverText text="Contact" />
      </Button>
    </Link>
  );
}
