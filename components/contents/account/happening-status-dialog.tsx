"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import {
  setHappeningStatus,
  withdrawSubmission,
} from "@/actions/happening-edits";
import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Textarea from "@/components/ui/text-area";

export type StatusAction = "cancel" | "postpone" | "withdraw";

const COPY: Record<
  StatusAction,
  { label: string; confirm: string; effect: string; note: boolean }
> = {
  cancel: {
    label: "Cancel happening",
    confirm: "Cancel happening",
    effect:
      "The Happenings team is told at once. Your listing stays visible on the calendar as Cancelled.",
    note: true,
  },
  postpone: {
    label: "Postpone happening",
    confirm: "Postpone happening",
    effect:
      "The Happenings team is told at once. Your listing stays visible as Postponed · New date to be confirmed. When you know the date, edit the happening.",
    note: true,
  },
  withdraw: {
    label: "Withdraw submission",
    confirm: "Withdraw submission",
    effect:
      "It leaves the review queue and never appears on the calendar. To list it later, submit it again.",
    note: false,
  },
};

const RESULT: Record<StatusAction, string> = {
  cancel: "cancelled",
  postpone: "postponed",
  withdraw: "withdrawn",
};

interface Props {
  eventId: number;
  action: StatusAction | null;
  title: string;
  when: string;
  onClose: () => void;
}

// Figma: 14 — Changes submitted · Cancel and postpone (the confirm dialog).
// Postponing has no date: the new date is always "to be confirmed" (option 1).
export default function HappeningStatusDialog({
  eventId,
  action,
  title,
  when,
  onClose,
}: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const copy = action ? COPY[action] : null;

  const confirm = () =>
    startTransition(async () => {
      if (!action) return;
      setError(undefined);
      const result =
        action === "withdraw"
          ? await withdrawSubmission(eventId)
          : await setHappeningStatus(
              eventId,
              action === "cancel" ? "cancelled" : "postponed",
              { note },
            );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(
        `/account/happenings/${eventId}/done?result=${RESULT[action]}`,
      );
    });

  return (
    <Modal.Root
      isOpen={Boolean(action)}
      onOpenChange={(open) => {
        if (!open && !isPending) {
          setError(undefined);
          onClose();
        }
      }}
    >
      <Modal.Content size="lg" scrollBehavior="normal">
        {copy && (
          <>
            <Modal.Header label={copy.label}>{title}</Modal.Header>
            <Modal.Body>
              <p className="font-courier text-sm tracking-cou uppercase">
                {when}
              </p>
              {copy.note && (
                <Textarea
                  label="Note for the Happenings team (optional)"
                  value={note}
                  onValueChange={setNote}
                  maxLength={1000}
                  isDisabled={isPending}
                  placeholder={
                    action === "postpone"
                      ? "For example: speaker travel has moved, we expect a January date."
                      : "For example: the venue is no longer available."
                  }
                />
              )}
              <p className="flex gap-3 bg-cream px-4 py-3.5 font-montreal text-base">
                <span
                  aria-hidden="true"
                  className="mt-2 size-2.5 shrink-0 rounded-full bg-red"
                />
                <span>{copy.effect}</span>
              </p>
              {error && (
                <p
                  role="alert"
                  className="font-courier text-xs tracking-cou text-red uppercase"
                >
                  {error}
                </p>
              )}
            </Modal.Body>
            <Modal.Footer className="flex-col items-stretch sm:flex-row">
              <Button
                size="md"
                variant="solid"
                className="w-full"
                isLoading={isPending}
                disabled={isPending}
                onPress={confirm}
              >
                <HoverText text={copy.confirm} />
              </Button>
              <Button
                size="md"
                variant="bordered"
                className="w-full"
                disabled={isPending}
                onPress={onClose}
              >
                <HoverText text="Keep as is" />
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
