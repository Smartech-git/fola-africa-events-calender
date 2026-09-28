import FadeUpText from "@/components/animations/fade-up-text";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  className?: string;
}
export default function HeaderTitle({ text, className }: Props) {
  return (
    <FadeUpText
      className={cn(
        "font-apris text-3xl font-medium tracking-wider text-primary uppercase sm:text-4xl",
        className,
      )}
      text={text}
    />
  );
}
