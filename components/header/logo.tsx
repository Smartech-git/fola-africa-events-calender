import Image from "next/image";
import Link from "next/link";

import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";


interface Props {
  className?: string;
  wrapperClassName?: string;
  isLight?: boolean;
  useLogo?: boolean;
}

export default function Logo({
  className,
  wrapperClassName,
  isLight = false,
  useLogo,
}: Props) {
  return (
    <Link
      href="/"
      className={cn(
        "size-fit flex-none decoration-0 outline-none",
        wrapperClassName,
      )}
    >
      <Button
        isFollowCursorLight={isLight}
        variant="flat"
        size="fit"
        className="w-fit"
      >
        {useLogo ? (
          <Image
            src="/assets/images/logo-810x673.svg"
            width={810}
            height={673}
            quality={100}
            alt="FOLA"
            preload
            sizes="(max-width: 640px) 40px, 40px"
            className={cn("h-auto w-8", className)}
          />
        ) : (
          <Image
            src={
              isLight
                ? "/assets/images/wordmark-light-1440x550.svg"
                : "/assets/images/wordmark-1440x550.svg"
            }
            width={1440}
            height={550}
            quality={100}
            alt="FOLA"
            sizes="(max-width: 640px) 110px, 58px"
            preload
            className={cn("h-auto w-13", className)}
          />
        )}
      </Button>
    </Link>
  );
}
