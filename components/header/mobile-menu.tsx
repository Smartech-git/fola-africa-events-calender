/* eslint-disable */
// @ts-nocheck
"use client";
import { Menu, X } from "lucide-react";

import Drawer from "@/components/ui/drawer";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HeaderNav from "@/components/header/header-nav";
import { Nav } from "@/constants/navs";
import Logo from "@/components/header/logo";
import ContactUs from "@/components/header/contact-us";
import FollowCursor from "@/components/ui/follow-cursor";
import Image from "next/image";
import Fade from "@/components/animations/fade";

interface Props {
  triggerClassName?: string;
  isLight?: boolean;
  color?: string;
  nav: Nav[];
}

export default function MobileMenu({
  triggerClassName,
  color,
  nav,
  isLight = false,
}: Props) {
  return (
    <Drawer.Root className="">
      <Drawer.Trigger
        color={color}
        isFollowCursorLight={isLight}
        className={cn(
          "size-fit gap-1 bg-transparent! font-inter text-xs font-normal sm:text-sm",
          triggerClassName,
          isLight && "text-primary-light",
        )}
        variant="light"
        size="fit"
      >
        menu
      </Drawer.Trigger>
      <Drawer.Content className="max-w-full">
        {(onClose) => (
          <>
            <Drawer.Header className="flex justify-between gap-4 border-b border-black/20 bg-primary-light py-0">
              <div className="grid min-h-sm-header w-full grid-cols-1 items-center gap-4 py-6 sm:min-h-header">
                <Button
                  onPress={onClose}
                  variant="light"
                  size="fit"
                  className="w-fit justify-self-center font-inter text-sm font-normal sm:text-base"
                >
                  Close
                </Button>
              </div>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col justify-between gap-12 bg-primary-light px-0! py-8 pt-0!">
              <div className="flex w-full flex-col gap-4">
                <HeaderNav nav={nav} close={onClose} />
              </div>
              <Fade className="px-pg-sm" duration={0.6}>
                <Image
                  src="/assets/images/wordmark-1440x550.svg"
                  width={1440}
                  height={550}
                  quality={100}
                  alt="FOLA"
                  sizes="500px"
                  preload
                  className="h-auto w-125"
                />
              </Fade>
            </Drawer.Body>
            <FollowCursor />
          </>
        )}
      </Drawer.Content>
    </Drawer.Root>
  );
}
