import { formatDay } from "@/lib/events/event-list";
import { cn } from "@/lib/utils";

interface Props {
  date: string;
  variant?: "outline" | "filled";
  className?: string;
}

export default function EventDateMark({
  date,
  variant = "outline",
  className,
}: Props) {
  return (
    <time
      dateTime={date}
      className={cn(
        "flex aspect-square shrink-0 flex-col items-center justify-center rounded-full font-courier uppercase",
        variant === "outline"
          ? "border-2 border-red text-red"
          : "bg-red text-white",
        className,
      )}
    >
      <span className="text-base tracking-cou md:text-[22px]">
        {formatDay(date, "EEE")}
      </span>
      <span className="text-xl leading-none md:text-[150px]">
        {formatDay(date, "dd")}
      </span>
      <span className="text-base max-md:hidden tracking-cou sm:text-[22px]">
        {formatDay(date, "MMM yyyy")}
      </span>
    </time>
  );
}
