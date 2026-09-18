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
        success: <CircleCheck size={20} className="text-secondary" />,
        info: <Info size={20} className="text-secondary" />,
        warning: <CircleAlert size={20} className="text-secondary" />,
        error: <CircleX size={20} className="text-secondary" />,
      }}
      toastOptions={{
        classNames: {
          icon: "absolute top-0.5! bottom-auto!",
          toast: "bg-primary! rounded-none! border-primary! text-black!",
          title: "text-current! font-apris uppercase ml-2 !mr-8 !font-semibold text-base!",
          description: "text-current! font-apris uppercase ml-2 !mr-8",
          actionButton: "action-button",
          cancelButton: "cancel-button",
          closeButton:
            "text-black! !top-6 !left-auto !size-6 !border-transparent !bg-transparent !right-1 absolute [&>svg]:w-5 [&>svg]:h-5",
        },
      }}
      position={position}
      closeButton
      richColors
      {...props}
    />
  );
}
