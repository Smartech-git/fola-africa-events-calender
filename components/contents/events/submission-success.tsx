"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import DrawHorizontalLine from "@/components/animations/draw-horizontal-line";
import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import HeaderTitle from "@/components/common/header-title";
import LabelTitle from "@/components/common/label-title";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import Drawer from "@/components/ui/drawer";

export default function SubmissionSuccess({
  isOpen,
  onOpenChange,
  onSubmitAnother,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitAnother: () => void;
}) {
  const router = useRouter();
  return (
    <Drawer.Root isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content
        size="5xl"
        scrollBehavior="inside"
        aria-label="Submission received"
        className="h-[60dvh] max-h-175 w-full max-w-none bg-primary-light text-dark-gray shadow-none sm:h-[80dvh] sm:max-h-[80dvh]"
      >
        {(onClose) => (
          <>
            <Drawer.Header className="shrink-0 border-y border-light-gray py-4 2xl:px-pg-2xl 4k:px-pg-4k">
              <Button
                variant="flat"
                size="fit"
                onPress={onClose}
                startContent={<ArrowLeft size={12} />}
              >
                <HoverText text="Back to submission" />
              </Button>
              <DrawHorizontalLine className="absolute bottom-0 left-0 animate-delay-500" />
            </Drawer.Header>
            <Drawer.Body className="scrollbar-none px-0! py-0">
              <SectionWrapper className="items-start py-8">
                <LabelTitle title="Submission received" />

                <HeaderTitle className="mt-4" text=" Thank you!" />
                <FadeUpText
                  className="text-xs uppercase"
                  delay={0.3}
                  text="Your event is with FOLA for review"
                />
                <FadeUpText
                  delay={0.6}
                  className="mt-12 max-w-100 text-xs leading-5 uppercase"
                  text={`Expected response: within two working days. Your listing will appear only after FOLA approval.`}
                />

                <Button
                  className="mt-8 w-full sm:w-fit"
                  onPress={() => router.push("/event/lagos")}
                >
                  <HoverText text="Return to calendar" />
                </Button>
                <div className="mt-4 w-full justify-center max-sm:flex">
                  <Button
                    variant="link"
                    className="w-fit"
                    size="fit"
                    onPress={onSubmitAnother}
                  >
                    <HoverText text="Submit another event" />
                  </Button>
                </div>
              </SectionWrapper>
            </Drawer.Body>
          </>
        )}
      </Drawer.Content>
    </Drawer.Root>
  );
}
