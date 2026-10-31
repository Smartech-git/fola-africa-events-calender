import type { Payload } from "payload";

export const ARTWORK_FORMATS = [
  { format: "jpeg", mimeType: "image/jpeg", extension: "jpg" },
  { format: "png", mimeType: "image/png", extension: "png" },
  { format: "webp", mimeType: "image/webp", extension: "webp" },
] as const;

// Vercel refuses request bodies over 4.5 MB; the browser shrinks images first.
export const ARTWORK_MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const ARTWORK_MIN_SIDE = 400;
export const ARTWORK_HOURLY_LIMIT = 20;
/** Member uploads never attached to a submission are deleted after this. */
export const UNUSED_UPLOAD_HOURS = 24;

/** Whether an event already uses this image as its artwork. */
export async function artworkInUse(
  payload: Payload,
  mediaId: number,
  transactionID?: string | number,
) {
  const { totalDocs } = await payload.count({
    collection: "events",
    where: { artwork: { equals: mediaId } },
    overrideAccess: true,
    req: transactionID ? { transactionID } : undefined,
  });
  return totalDocs > 0;
}

/**
 * Checks the artwork a member attaches to a new submission: their own upload,
 * and not already on another event. Returns an error message, or null.
 */
export async function checkSubmittedArtwork(
  payload: Payload,
  mediaId: number,
  memberId: number | undefined,
) {
  if (!memberId) return "Sign in to add artwork to your submission.";
  const media = await payload.findByID({
    collection: "media",
    id: mediaId,
    depth: 0,
    overrideAccess: true,
    disableErrors: true,
    joins: false,
  });
  if (!media || media.uploadedBy !== memberId)
    return "Upload your artwork again.";
  if (await artworkInUse(payload, mediaId))
    return "This artwork is already on another submission. Upload it again.";
  return null;
}

/** Deletes members' uploads that never made it onto a submission. */
export async function deleteUnusedUploads(payload: Payload) {
  const cutoff = new Date(
    Date.now() - UNUSED_UPLOAD_HOURS * 60 * 60 * 1000,
  ).toISOString();
  const candidates = await payload.find({
    collection: "media",
    where: {
      and: [
        { uploadedBy: { exists: true } },
        { createdAt: { less_than: cutoff } },
      ],
    },
    limit: 200,
    depth: 0,
    overrideAccess: true,
    joins: false,
    // The ID always comes back; select one small field so nothing else does.
    select: { createdAt: true },
  });
  let deleted = 0;
  for (const { id } of candidates.docs) {
    if (await artworkInUse(payload, id)) continue;
    // Deleting the record deletes every size from Vercel Blob.
    await payload.delete({ collection: "media", id, overrideAccess: true });
    deleted++;
  }
  return { deleted };
}
