import React from "react";

import Link from "next/link";

import Button from "@/components/ui/button";

interface Props {
  title: string;
  email: string;
}

export default function EmailDetails({ title, email }: Props) {
  return (
    <div className="flex flex-col gap-1 font-inter text-primary max-md:items-center">
      <h2 className="text-xs text-nowrap uppercase sm:text-xs">{title}</h2>
      <Link className="w-fit" href={`mailto:${email}`}>
        <Button
          variant="flat"
          className="text-xs font-normal uppercase underline sm:text-xs"
          size="fit"
        >
          {email}
        </Button>
      </Link>
    </div>
  );
}
