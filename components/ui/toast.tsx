"use client";

import { X } from "lucide-react";
import { Toaster, ToasterProps } from "sonner";

export default function Toast({
  position = "top-right",
  ...props
}: ToasterProps) {
  return (
    <Toaster
      icons={{ close: <X size={18} aria-hidden="true" /> }}
      toastOptions={{
        classNames: {
          toast:
            "items-start! gap-1.5! rounded-none! border-0! bg-ink! px-6! py-5! pr-12! text-white! shadow-none!",
          error: "bg-red! [&_[data-title]]:text-white!",
          icon: "hidden!",
          content: "gap-1.5!",
          title:
            "font-courier! text-xs! font-normal! tracking-cou text-cream! uppercase sm:text-sm!",
          description: "font-montreal! text-base! text-white!",
          actionButton:
            "h-auto! rounded-none! bg-white! px-3! py-2! font-courier! text-xs! tracking-cou text-ink! uppercase",
          cancelButton:
            "h-auto! rounded-none! border! border-white/40! bg-transparent! px-3! py-2! font-courier! text-xs! tracking-cou text-white! uppercase",
          closeButton:
            "top-4! right-4! left-auto! size-6! transform-none! rounded-none! border-0! bg-transparent! text-white! hover:text-cream!",
        },
      }}
      position={position}
      closeButton
      {...props}
    />
  );
}
