import { signOut } from "@/actions/member-auth";
import HoverText from "@/components/animations/hover-text";
import Button, { type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Ends the session on this browser. Works without JavaScript. */
export default function SignOutButton({
  className,
  variant = "bordered",
  size = "md",
}: Pick<ButtonProps, "className" | "variant" | "size">) {
  return (
    <form action={signOut} className={cn("w-full", className)}>
      <Button type="submit" variant={variant} size={size} className="w-full">
        <HoverText text="Sign out" />
      </Button>
    </form>
  );
}
