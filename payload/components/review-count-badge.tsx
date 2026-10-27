import type { Payload, TypedUser } from "payload";

/**
 * Bubble counting events waiting in the review queue, on the Event Reviews nav
 * link and dashboard card. Payload renders both itself, so the count is
 * attached to their `#nav-event-reviews` and `#card-event-reviews` elements
 * with generated CSS. Rendered before the nav links, so it is on every page.
 */
export async function ReviewCountBadge({
  payload,
  user,
}: {
  payload: Payload;
  user?: TypedUser | null;
}) {
  if (!user) return null;
  const { totalDocs } = await payload.count({
    collection: "events",
    where: {
      and: [
        { status: { equals: "submitted" } },
        { isDemo: { not_equals: true } },
      ],
    },
    user,
    overrideAccess: false,
  });
  if (!totalDocs) return null;

  const label = totalDocs > 99 ? "99+" : String(totalDocs);
  return (
    <style>{`
      #nav-event-reviews::after,
      #card-event-reviews::after {
        content: "${label}";
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
      /* Far right of the nav row, centred on the label. */
      #nav-event-reviews::after {
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }
      #card-event-reviews::after {
        top: -0.5rem;
        right: -0.5rem;
      }
    `}</style>
  );
}
