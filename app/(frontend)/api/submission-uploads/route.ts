import { randomBytes } from "node:crypto";

import sharp from "sharp";

import { getMember } from "@/lib/auth/member-session";
import { getCalendarPayload } from "@/payload/queries/calendar-query";
import {
  ARTWORK_FORMATS,
  ARTWORK_HOURLY_LIMIT,
  ARTWORK_MAX_UPLOAD_BYTES,
  ARTWORK_MIN_SIDE,
  artworkInUse,
} from "@/payload/submissions/artwork";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const error = (message: string, status: number) =>
  Response.json({ error: message }, { status });

/**
 * POST /api/submission-uploads: a signed-in member's event artwork, sent as
 * multipart `file`. The browser shrinks images first; Payload then resizes,
 * re-encodes (dropping location data) and stores them in Vercel Blob. Returns
 * the media ID the submission form sends with the event.
 */
export async function POST(request: Request) {
  const member = await getMember();
  if (!member) return error("Sign in to upload artwork.", 401);

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return error("Upload a JPG, PNG or WebP image.", 400);
  }
  if (!(file instanceof File) || !file.size)
    return error("Upload a JPG, PNG or WebP image.", 400);
  if (file.size > ARTWORK_MAX_UPLOAD_BYTES)
    return error("This image is too large. Upload one under 4 MB.", 413);

  const buffer = Buffer.from(await file.arrayBuffer());
  // Trust the decoded image, not the file name or the browser's type.
  let format: string | undefined;
  let width = 0;
  let height = 0;
  try {
    ({ format, width = 0, height = 0 } = await sharp(buffer).metadata());
  } catch {
    format = undefined;
  }
  const type = ARTWORK_FORMATS.find((entry) => entry.format === format);
  if (!type) return error("Upload a JPG, PNG or WebP image.", 415);
  if (Math.min(width, height) < ARTWORK_MIN_SIDE)
    return error(
      `This image is too small. Use one at least ${ARTWORK_MIN_SIDE}px on each side.`,
      422,
    );

  const payload = await getCalendarPayload();
  const recent = await payload.count({
    collection: "media",
    where: {
      and: [
        { uploadedBy: { equals: member.id } },
        {
          createdAt: {
            greater_than: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
        },
      ],
    },
    overrideAccess: true,
  });
  if (recent.totalDocs >= ARTWORK_HOURLY_LIMIT)
    return error(
      "You’ve uploaded a lot of images recently. Please try again in an hour.",
      429,
    );

  try {
    const media = await payload.create({
      collection: "media",
      // The member is not a Payload user; this route has checked who they are.
      overrideAccess: true,
      depth: 0,
      data: { alt: "Event artwork", uploadedBy: member.id },
      file: {
        data: buffer,
        mimetype: type.mimeType,
        // Unguessable, so unapproved artwork cannot be found by its address.
        name: `artwork-${randomBytes(12).toString("hex")}.${type.extension}`,
        size: buffer.length,
      },
    });
    return Response.json(
      {
        id: media.id,
        url: media.sizes?.card?.url ?? media.url,
        width: media.width,
        height: media.height,
      },
      { status: 201 },
    );
  } catch (cause) {
    console.error("Artwork upload failed", cause);
    return error("We couldn’t save this image. Please try again.", 500);
  }
}

/** DELETE /api/submission-uploads?id=…: removes the member's own unused upload. */
export async function DELETE(request: Request) {
  const member = await getMember();
  if (!member) return error("Sign in to manage uploads.", 401);
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return error("Unknown upload.", 400);

  const payload = await getCalendarPayload();
  const media = await payload.findByID({
    collection: "media",
    id,
    depth: 0,
    overrideAccess: true,
    disableErrors: true,
    joins: false,
  });
  // Someone else's upload looks the same as a missing one.
  if (!media || media.uploadedBy !== member.id)
    return error("Unknown upload.", 404);
  // Artwork already on a submitted event stays until staff remove it.
  if (await artworkInUse(payload, id)) return Response.json({ deleted: false });
  await payload.delete({
    collection: "media",
    id,
    overrideAccess: true,
  });
  return Response.json({ deleted: true });
}
