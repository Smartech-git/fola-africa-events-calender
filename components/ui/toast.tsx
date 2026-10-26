"use client";

import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";
import { Toaster, ToasterProps } from "sonner";

export default function Toast({
  position = "top-right",
  ...props
}: ToasterProps) {
  return (
    <Toaster
      icons={{
        success: <CircleCheck size={20} className="text-cream" />,
        info: <Info size={20} className="text-cream" />,
        warning: <CircleAlert size={20} className="text-cream" />,
        error: <CircleX size={20} className="text-cream" />,
      }}
      toastOptions={{
        classNames: {
          icon: "absolute top-0.5! bottom-auto!",
          toast: "bg-ink! rounded-none! border-ink! text-white! shadow-none!",
          error: "bg-red! border-red!",
          title:
            "text-current! font-courier uppercase tracking-mono ml-2 !mr-8 !font-normal text-sm!",
          description: "text-current! font-montreal ml-2 !mr-8 text-sm!",
          actionButton: "action-button",
          cancelButton: "cancel-button",
          closeButton:
            "text-white! !top-6 !left-auto !size-6 !border-transparent !bg-transparent !right-1 absolute [&>svg]:w-5 [&>svg]:h-5",
        },
      }}
      position={position}
      closeButton
      {...props}
    />
  );
}
