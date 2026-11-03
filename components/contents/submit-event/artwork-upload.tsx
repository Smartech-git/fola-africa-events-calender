"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";

import { ImageUp, RotateCcw, Upload, X } from "lucide-react";

import Button from "@/components/ui/button";
import { MAX_IMAGE_BYTES, MAX_IMAGE_MB } from "@/constants/media";
import { cn } from "@/lib/utils";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
// Images this small and within MAX_SIDE are sent as they are.
const SEND_AS_IS_BYTES = 3 * 1024 * 1024;
const MAX_SIDE = 2400;
const ENDPOINT = "/api/submission-uploads";

type Status =
  | { kind: "empty" }
  | { kind: "working"; step: "preparing" | "uploading"; progress: number }
  | { kind: "done" }
  | { kind: "error"; message: string };

/**
 * Redraws the image at most MAX_SIDE px on its longest side, so phone photos
 * fit Vercel's 4.5 MB request limit. The server checks and re-encodes it again.
 */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= SEND_AS_IS_BYTES) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d")!;
  // Transparent areas would turn black as JPEG.
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.86));
  // Safari cannot encode WebP and hands back a PNG instead.
  const webp = await encode("image/webp");
  if (webp?.type === "image/webp") return webp;
  const jpeg = await encode("image/jpeg");
  if (!jpeg) throw new Error("encode");
  return jpeg;
}

/** Sends the image with progress, which fetch cannot report for uploads. */
function send(blob: Blob, onProgress: (percent: number) => void) {
  return new Promise<{ id: number }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", ENDPOINT);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      let body: { id?: number; error?: string } = {};
      try {
        body = JSON.parse(request.responseText);
      } catch {}
      if (request.status >= 200 && request.status < 300 && body.id)
        resolve({ id: body.id });
      else
        reject(
          new Error(
            body.error ?? "We couldn’t upload this image. Please try again.",
          ),
        );
    };
    request.onerror = () =>
      reject(new Error("Upload failed. Check your connection and try again."));
    const form = new FormData();
    const extension = blob.type.split("/")[1] ?? "jpg";
    form.append("file", blob, `artwork.${extension}`);
    request.send(form);
  });
}

interface Props {
  /** The uploaded media ID, or "". */
  value: string;
  onChange: (id: string) => void;
  /** True while an image is being prepared or uploaded. */
  onBusyChange: (busy: boolean) => void;
  disabled?: boolean;
  error?: string;
  /** Artwork already on the happening, shown until it is replaced or removed. */
  current?: { id: string; url: string };
}

// Figma: Submission Form — 05 Show us the Happening, "Event artwork or graphic".
export default function ArtworkUpload({
  value,
  onChange,
  onBusyChange,
  disabled,
  error,
  current,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const showingCurrent = Boolean(current && value === current.id);
  const [status, setStatus] = useState<Status>(
    showingCurrent ? { kind: "done" } : { kind: "empty" },
  );
  const [preview, setPreview] = useState<string | null>(
    showingCurrent ? current!.url : null,
  );
  const [chosen, setChosen] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  // Free the preview's memory when it is replaced or the form goes away.
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const working = status.kind === "working";
  const locked = disabled || working;

  const discard = (id: string) => {
    // Best effort: the daily cleanup removes anything this misses.
    if (id)
      void fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => undefined);
  };

  const upload = async (file: File) => {
    if (!ACCEPT.includes(file.type)) {
      setStatus({ kind: "error", message: "Choose a JPG, PNG or WebP image." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setStatus({
        kind: "error",
        message: `This image is over ${MAX_IMAGE_MB} MB. Choose a smaller one.`,
      });
      return;
    }
    setChosen(file);
    onBusyChange(true);
    setStatus({ kind: "working", step: "preparing", progress: 0 });
    try {
      let blob: Blob;
      try {
        blob = await shrink(file);
      } catch {
        throw new Error(
          "We couldn’t read this image. Save it as a JPG or PNG and try again.",
        );
      }
      setPreview(URL.createObjectURL(blob));
      setStatus({ kind: "working", step: "uploading", progress: 0 });
      const { id } = await send(blob, (progress) =>
        setStatus({ kind: "working", step: "uploading", progress }),
      );
      // A replaced upload is no longer needed.
      discard(value);
      onChange(String(id));
      setStatus({ kind: "done" });
    } catch (cause) {
      // A failed replacement leaves no artwork rather than a hidden old one.
      if (value) {
        discard(value);
        onChange("");
      }
      setPreview(null);
      setStatus({
        kind: "error",
        message:
          cause instanceof Error
            ? cause.message
            : "We couldn’t upload this image. Please try again.",
      });
    } finally {
      onBusyChange(false);
    }
  };

  const choose = (files: FileList | null) => {
    const file = files?.[0];
    if (file) void upload(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = () => {
    discard(value);
    onChange("");
    setPreview(null);
    setChosen(null);
    setStatus({ kind: "empty" });
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!locked) choose(event.dataTransfer.files);
  };

  const message =
    status.kind === "error" ? status.message : !working ? error : undefined;
  const hasImage = Boolean(preview) && (working || status.kind === "done");

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT.join(",")}
        className="sr-only"
        disabled={locked}
        onChange={(event) => choose(event.target.files)}
      />
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!locked) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center gap-3 border border-dashed bg-white px-6 py-7 text-center transition-colors",
          dragging ? "border-red bg-cream" : "border-ink/50",
          message && "border-red",
        )}
      >
        <span className="bg-red px-2.5 py-1 font-courier text-[11px] tracking-cou text-white uppercase">
          May be shown publicly
        </span>

        {hasImage ? (
          // A local preview of the shrunk image, not a remote URL.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview!}
            alt="Your event artwork"
            className={cn(
              "max-h-80 w-auto max-w-full border border-ink/15 object-contain",
              working && "opacity-60",
            )}
          />
        ) : (
          <Upload size={28} aria-hidden="true" className="text-ink" />
        )}

        <label
          htmlFor={inputId}
          className={cn(
            "font-courier text-sm tracking-cou text-red uppercase",
            !locked && "cursor-pointer hover:underline",
          )}
        >
          Event artwork or graphic
        </label>

        <p aria-live="polite" className="font-montreal text-base">
          {working
            ? status.step === "preparing"
              ? "Preparing your image…"
              : `Uploading… ${status.progress}%`
            : status.kind === "done"
              ? chosen
                ? `${chosen.name} is uploaded.`
                : "The current artwork."
              : "Drop a file or browse. Artwork may be displayed publicly where appropriate"}
        </p>
        {working && (
          <span aria-hidden="true" className="h-0.5 w-full max-w-60 bg-ink/10">
            <span
              className="block h-full bg-red transition-[width]"
              style={{
                width: `${status.step === "preparing" ? 5 : status.progress}%`,
              }}
            />
          </span>
        )}
        {!hasImage && (
          <span className="font-courier text-[11px] tracking-cou text-ink/60 uppercase">
            JPG, PNG or WEBP · Up to {MAX_IMAGE_MB} MB
          </span>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          {status.kind === "done" ? (
            <>
              <Button
                type="button"
                variant="bordered"
                size="sm"
                disabled={locked}
                onPress={() => inputRef.current?.click()}
                startContent={<ImageUp size={14} aria-hidden="true" />}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="bordered"
                size="sm"
                disabled={locked}
                onPress={remove}
                startContent={<X size={14} aria-hidden="true" />}
              >
                Remove
              </Button>
            </>
          ) : status.kind === "error" && chosen ? (
            <Button
              type="button"
              variant="bordered"
              size="sm"
              disabled={locked}
              onPress={() => void upload(chosen)}
              startContent={<RotateCcw size={14} aria-hidden="true" />}
            >
              Try again
            </Button>
          ) : null}
          {!working && status.kind !== "done" && (
            <Button
              type="button"
              variant="solid"
              size="sm"
              disabled={locked}
              onPress={() => inputRef.current?.click()}
            >
              Browse
            </Button>
          )}
        </div>
      </div>
      {message && (
        <p
          role="alert"
          className="font-courier text-xs tracking-cou text-red uppercase"
        >
          {message}
        </p>
      )}
    </div>
  );
}
