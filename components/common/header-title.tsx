import FadeUpText from "@/components/animations/fade-up-text";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  id?: string;
}
export default function HeaderTitle({ text, className, as, id }: Props) {
  return (
    <FadeUpText
      as={as}
      id={id}
      className={cn(
        "font-apris text-3xl font-medium tracking-wider text-primary uppercase sm:text-4xl",
        className,
      )}
      text={text}
    />
  );
}
