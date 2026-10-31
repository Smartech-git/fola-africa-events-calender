import { del } from "@vercel/blob";
import {
  APIError,
  type CollectionBeforeOperationHook,
  type CollectionConfig,
} from "payload";

import { MAX_IMAGE_BYTES, MAX_IMAGE_MB } from "@/constants/media";
import { isAdmin, isStaff } from "@/payload/access";

/** Formats accepted for event artwork, from staff and from members. */
export const ARTWORK_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const webp = { format: "webp", options: { quality: 80 } } as const;
const PREFIX = "media";

/**
 * Refuses images over 5 MB, from members and from staff. Admin uploads go
 * straight from the browser to Blob before Payload sees them, so a refused one
 * is deleted from Blob here too.
 */
const limitFileSize: CollectionBeforeOperationHook = async ({
  operation,
  req,
}) => {
  const file = req.file;
  if (!["create", "update"].includes(operation) || !file) return;
  if (file.size <= MAX_IMAGE_BYTES) return;
  if (file.clientUploadContext)
    await del(`${PREFIX}/${file.name}`, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }).catch(() => undefined);
  throw new APIError(
    `Images must be ${MAX_IMAGE_MB} MB or smaller. This one is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
    413,
    undefined,
    true,
  );
};

/**
 * Images, stored in Vercel Blob (see payload.config.ts). Files are public, so
 * pages load them straight from the Blob CDN; only approved, published Full
 * listings ever link to submitted artwork.
 */
export const media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt",
    group: "Calendar",
    defaultColumns: ["filename", "alt", "uploadedBy", "createdAt"],
    description:
      "Event artwork: JPG, PNG or WebP, up to 5 MB. Member uploads that are never attached to a submission are deleted after a day.",
  },
  hooks: { beforeOperation: [limitFileSize] },
  access: {
    read: () => true,
    create: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  upload: {
    mimeTypes: ARTWORK_MIME_TYPES,
    // The stored original is capped and re-encoded too, which also drops
    // location and camera data from photos.
    resizeOptions: {
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    },
    formatOptions: webp,
    focalPoint: true,
    imageSizes: [
      // List cards and thumbnails in the admin.
      {
        name: "card",
        width: 800,
        withoutEnlargement: true,
        formatOptions: webp,
      },
      // The event page.
      {
        name: "detail",
        width: 1600,
        withoutEnlargement: true,
        formatOptions: webp,
      },
      // Link previews when an event is shared.
      {
        name: "og",
        width: 1200,
        height: 630,
        position: "centre",
        formatOptions: webp,
      },
    ],
    adminThumbnail: "card",
  },
  fields: [
    {
      name: "alt",
      label: "Alt text",
      type: "text",
      required: true,
      admin: {
        description:
          "Describe the image for people who cannot see it, e.g. “Poster for the 2027 Markets Outlook”.",
      },
    },
    {
      name: "uploadedBy",
      label: "Uploaded by member",
      type: "relationship",
      relationTo: "members",
      index: true,
      access: { create: () => false, update: () => false },
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "events",
      label: "Used on",
      type: "join",
      collection: "events",
      on: "artwork",
    },
  ],
};
