"use client";

import {
  createContext,
  useContext,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from "react";

import {
  Modal as HeroModal,
  ModalBody as HeroModalBody,
  ModalContent as HeroModalContent,
  ModalFooter as HeroModalFooter,
  ModalHeader as HeroModalHeader,
  useDisclosure,
} from "@heroui/react";
import { X } from "lucide-react";

import Button, { type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalContextType = ReturnType<typeof useDisclosure>;
const ModalContext = createContext<ModalContextType | null>(null);

/** Open, close or read the state of the nearest Modal.Root. */
export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal subcomponents must be used within Modal.Root");
  }
  return context;
}

// Square and flat like the rest of the system: white panel with an ink rule,
// Montreal caps title, Courier caps labels and a round close button.
const Modal = {
  Root: function ModalRoot({
    children,
    isOpen,
    defaultOpen,
    onOpenChange,
  }: {
    children: ReactNode;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
  }) {
    const disclosure = useDisclosure({
      isOpen,
      defaultOpen,
      onOpen: () => onOpenChange?.(true),
      onClose: () => onOpenChange?.(false),
    });
    return (
      <ModalContext.Provider value={disclosure}>
        {children}
      </ModalContext.Provider>
    );
  },

  Trigger: function ModalTrigger({
    button: CustomButton,
    ...props
  }: ButtonProps & {
    button?: ComponentType<ButtonProps & { onOpen: () => void }>;
  }) {
    const { onOpen } = useModal();
    if (CustomButton) return <CustomButton {...props} onOpen={onOpen} />;
    return (
      <Button
        {...props}
        onPress={(event) => {
          props.onPress?.(event);
          onOpen();
        }}
      />
    );
  },

  Content: function ModalContent({
    children,
    className,
    classNames,
    hideCloseButton = false,
    closeLabel = "Close",
    ...modalProps
  }: {
    children: ReactNode | ((onClose: () => void) => ReactNode);
    /** Accessible name for the close button. */
    closeLabel?: string;
  } & Omit<
    ComponentProps<typeof HeroModal>,
    "children" | "isOpen" | "onOpenChange"
  >) {
    const { isOpen, onOpenChange, onClose } = useModal();
    return (
      <HeroModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="lg"
        radius="none"
        backdrop="opaque"
        scrollBehavior="inside"
        // The project's own close button below replaces HeroUI's.
        hideCloseButton
        className={cn(
          "border border-ink bg-white text-ink shadow-none max-sm:mx-0 max-sm:mb-0 max-sm:border-x-0 max-sm:border-b-0",
          className,
        )}
        classNames={{
          ...classNames,
          // Above the header (z-60) and back-to-top button (z-70).
          wrapper: cn("z-99", classNames?.wrapper),
          backdrop: cn("z-99 bg-ink/60", classNames?.backdrop),
        }}
        {...modalProps}
      >
        <HeroModalContent>
          {(close) => (
            <>
              {/* Like the mobile menu's: a solid round icon button. */}
              {!hideCloseButton && (
                <Button
                  variant="bordered"
                  size="icon"
                  onPress={close ?? onClose}
                  aria-label={closeLabel}
                  className="absolute top-4 right-4 z-10 rounded-full hover:border-red hover:bg-red hover:text-white sm:top-5 sm:right-5"
                >
                  <X size={16} aria-hidden="true" />
                </Button>
              )}
              {typeof children === "function"
                ? children(close ?? onClose)
                : children}
            </>
          )}
        </HeroModalContent>
      </HeroModal>
    );
  },

  Header: function ModalHeader({
    label,
    children,
    className,
    ...rest
  }: ComponentProps<typeof HeroModalHeader> & {
    /** Courier caps line above the title, marked with a red circle. */
    label?: ReactNode;
  }) {
    return (
      <HeroModalHeader
        className={cn(
          "flex flex-col gap-3 px-5 pt-6 pr-18 pb-4 sm:px-8 sm:pt-8 sm:pr-20",
          className,
        )}
        {...rest}
      >
        {label && (
          <span className="flex items-center gap-2.5 font-courier text-xs font-normal tracking-cou text-red uppercase sm:text-sm">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full bg-red"
            />
            {label}
          </span>
        )}
        <span className="font-montreal text-2xl font-medium tracking-mono uppercase sm:text-3xl">
          {children}
        </span>
      </HeroModalHeader>
    );
  },

  Body: function ModalBody({
    className,
    ...rest
  }: ComponentProps<typeof HeroModalBody>) {
    return (
      <HeroModalBody
        // Lenis smooth-scrolls the page; let the modal scroll natively.
        data-lenis-prevent
        className={cn(
          "scrollbar-thin gap-4 px-5 py-2 font-montreal text-base sm:px-8 sm:text-lg",
          className,
        )}
        {...rest}
      />
    );
  },

  Footer: function ModalFooter({
    className,
    ...rest
  }: ComponentProps<typeof HeroModalFooter>) {
    return (
      <HeroModalFooter
        className={cn(
          "flex-wrap gap-3 px-5 pt-4 pb-6 max-sm:*:flex-1 sm:px-8 sm:pb-8",
          className,
        )}
        {...rest}
      />
    );
  },
};

export default Modal;
