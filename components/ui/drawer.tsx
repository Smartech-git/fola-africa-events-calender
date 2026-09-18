"use client";

import { createContext, useContext, ComponentProps } from "react";

import {
  Drawer as HeroDrawer,
  DrawerContent as HeroDrawerContent,
  DrawerHeader as HeroDrawerHeader,
  DrawerBody as HeroDrawerBody,
  DrawerFooter as HeroDrawerFooter,
  useDisclosure,
} from "@heroui/react";

import Button, { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DrawerContextType = ReturnType<typeof useDisclosure>;
const DrawerContext = createContext<DrawerContextType | null>(null);

function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer subcomponents must be used within Drawer.Root");
  }
  return context;
}

const Drawer = {
  Root: function DrawerRoot({ children }: { children: React.ReactNode }) {
    const disclosure = useDisclosure();
    return (
      <DrawerContext.Provider value={disclosure}>
        {children}
      </DrawerContext.Provider>
    );
  },

  Trigger: function DrawerTrigger(props: ButtonProps) {
    const { onOpen } = useDrawer();
    return <Button onPress={onOpen} {...props} />;
  },

  Content: function DrawerContent({
    children,
    className,
    ...drawerProps
  }: {
    children: (
      onClose: () => void,
    ) => React.ReactNode | ((onClose: () => void) => React.ReactNode);
  } & Omit<ComponentProps<typeof HeroDrawer>, "isOpen" | "onOpenChange">) {
    const { isOpen, onOpenChange, onClose } = useDrawer();

    const motionProps = {
      initial: { opacity: 0, y: 0, scale: 1.02 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 0, scale: 1.02 },
    };

    return (
      <HeroDrawer
        size="full"
        hideCloseButton={true}
        motionProps={motionProps}
        className={cn("max-w-125 rounded-none", className)}
        isOpen={isOpen}
        classNames={{ backdrop: ["z-99"], wrapper: ["z-99"] }}
        onOpenChange={onOpenChange}
        {...drawerProps}
      >
        <HeroDrawerContent>
          {typeof children === "function" ? children(onClose) : children}
        </HeroDrawerContent>
      </HeroDrawer>
    );
  },

  Header: function DrawerHeader(
    props: ComponentProps<typeof HeroDrawerHeader>,
  ) {
    const { className, ...rest } = props;
    return (
      <HeroDrawerHeader
        className={cn("flex items-center px-pg-sm sm:px-pg", className)}
        {...rest}
      />
    );
  },

  Body: function DrawerBody(props: ComponentProps<typeof HeroDrawerBody>) {
    const { className, ...rest } = props;

    return (
      <HeroDrawerBody
        className={cn("px-pg-sm sm:px-pg", className)}
        {...rest}
      />
    );
  },

  Footer: function DrawerFooter(
    props: ComponentProps<typeof HeroDrawerFooter>,
  ) {
    return <HeroDrawerFooter {...props} />;
  },
};

export default Drawer;
