import HeaderNav from "@/components/header/header-nav";
import Logo from "@/components/header/logo";
import MobileMenu from "@/components/header/mobile-menu";
import SearchEvent from "@/components/header/search-event";
// import SignIn from "@/components/header/sign-in";
import SubmitEvent from "@/components/header/submit-event";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  isLight?: boolean;
}

export default function Header({ className, isLight = false }: Props) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-sm-header w-full flex-none items-center justify-between gap-6 bg-white px-pg-sm text-ink sm:h-header sm:px-pg 2xl:px-pg-2xl 4k:px-pg-4k",
        isLight && "bg-red text-white",
        className,
      )}
    >
      <Logo variant={isLight ? "white" : "red"} />
      <div className="flex items-center gap-2 lg:gap-6">
        <HeaderNav className="flex items-center max-lg:hidden" />
        <SearchEvent />
        <SubmitEvent
          className="max-lg:hidden"
          variant={isLight ? "onWhite" : "solid"}
        />
        {/* <SignIn className="max-lg:hidden" /> */}
        <MobileMenu className="lg:hidden" />
      </div>
    </header>
  );
}
