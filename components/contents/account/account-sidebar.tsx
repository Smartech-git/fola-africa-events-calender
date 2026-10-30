import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import SignOutButton from "@/components/contents/account/sign-out-button";
import Button from "@/components/ui/button";
import { initials } from "@/lib/utils";
import type { HappeningFilter } from "@/payload/members/member-happenings";
import type { Member } from "@/payload-types";

const COUNTS: { filter: HappeningFilter; label: string }[] = [
  { filter: "upcoming", label: "Upcoming" },
  { filter: "pending", label: "Pending review" },
  { filter: "live", label: "Live" },
];

interface Props {
  member: Member;
  counts: Record<HappeningFilter, number>;
}

// Figma: 24 — Profile, the card beside the form.
export default function AccountSidebar({ member, counts }: Props) {
  const since = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(member.createdAt));
  const title = [member.role, member.organisation].filter(Boolean).join(" · ");

  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:w-75 lg:shrink-0 lg:self-start">
      <div className="flex flex-col gap-4 bg-cream p-5">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full border-[1.5px] border-red font-courier text-lg tracking-cou text-red"
          >
            {initials(member.fullName)}
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="font-montreal text-2xl font-medium wrap-break-word">
              {member.fullName}
            </span>
            {title && (
              <span className="font-courier text-xs tracking-cou text-ink/60 uppercase">
                {title}
              </span>
            )}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-ink/20 pt-4">
          <span className="font-montreal text-base break-all">
            {member.email}
          </span>
          <span className="flex gap-2 font-courier text-xs tracking-cou text-red uppercase">
            <span
              aria-hidden="true"
              className="size-2 mt-1 shrink-0 rounded-full bg-red"
            />
            Verified · Member since {since}
          </span>
        </div>
      </div>

      <ul aria-label="Your happenings" className="flex flex-col">
        {COUNTS.map(({ filter, label }) => (
          <li key={filter} className="border-b border-ink/20">
            <Link
              href={`/account/happenings?show=${filter}`}
              className="flex items-center justify-between py-3 transition-colors hover:text-red focus-visible:outline-2 focus-visible:outline-red"
            >
              <span className="font-courier text-xs tracking-cou uppercase">
                {label}
              </span>
              <span className="font-courier text-sm">{counts[filter]}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        <Link href="/submit-event/form" className="w-full">
          <Button variant="solid" size="md" className="w-full">
            <HoverText text="Submit a happening" />
          </Button>
        </Link>
        <SignOutButton />
      </div>
    </aside>
  );
}
