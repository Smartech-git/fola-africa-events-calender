import DotField from "@/components/animations/dot-field";
import { cn } from "@/lib/utils";

export default function EventArtwork({ className }: { className?: string }) {
  return (
    <figure
      className={cn(
        "relative flex aspect-4/5 w-full shrink-0 flex-col justify-end overflow-hidden bg-red p-6",
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-3.5">
        <DotField />
      </div>
      {/* <figcaption className="relative w-fit bg-red px-2.5 py-1.5 font-courier text-xs tracking-cou text-white uppercase">
        Event artwork · Supplied by the organiser
      </figcaption> */}
    </figure>
  );
}
