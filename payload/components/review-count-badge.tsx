import type { Payload, TypedUser, Where } from "payload";

/**
 * Bubbles counting work still waiting on a decision, on the Event Reviews and
 * Change Requests nav links and dashboard cards. Payload renders both itself,
 * so each count is attached to their `#nav-<slug>` and `#card-<slug>`
 * elements with generated CSS. Rendered before the nav links, so it is on
 * every page.
 *
 * Only public submissions get a review, so reviews count while their event is
 * still Submitted, not Submitted events: a FOLA entry saved as Submitted has
 * no review and would never appear on the Event Reviews page.
 */
const QUEUES: { slug: "event-reviews" | "event-changes"; where: Where }[] = [
  {
    slug: "event-reviews",
    where: {
      and: [
        { "event.status": { equals: "submitted" } },
        { "event.isDemo": { not_equals: true } },
      ],
    },
  },
  { slug: "event-changes", where: { status: { equals: "pending" } } },
];

export async function ReviewCountBadge({
  payload,
  user,
}: {
  payload: Payload;
  user?: TypedUser | null;
}) {
  if (!user) return null;
  const counts = await Promise.all(
    QUEUES.map(async ({ slug, where }) => {
      const { totalDocs } = await payload.count({
        collection: slug,
        where,
        user,
        overrideAccess: false,
      });
      return { slug, totalDocs };
    }),
  );
  const pending = counts.filter(({ totalDocs }) => totalDocs > 0);
  if (!pending.length) return null;

  const badges = pending
    .map(({ slug, totalDocs }) => {
      const label = totalDocs > 99 ? "99+" : String(totalDocs);
      return `
      #nav-${slug}::after,
      #card-${slug}::after { content: "${label}"; }
      #nav-${slug}::after { top: 50%; right: 0; transform: translateY(-50%); }
      #card-${slug}::after { top: -0.5rem; right: -0.5rem; }`;
    })
    .join("");
  const selectors = pending
    .flatMap(({ slug }) => [`#nav-${slug}::after`, `#card-${slug}::after`])
    .join(",\n      ");

  return (
    <style>{`
      ${selectors} {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 1.5rem;
        height: 1.5rem;
        padding: 0 0.375rem;
        border-radius: 999px;
        background: #ffffff;
        color: #000;
        font-size: 0.75rem;
        font-weight: 600;
        line-height: 1;
        pointer-events: none;
        z-index: 3;
      }
      /* Nav: far right of the row, centred on the label. Card: top corner. */${badges}
    `}</style>
  );
}
