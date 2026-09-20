# FOLA calendar backend

Source: `FOLA_Events_Calendar_Product_Brief_v2.docx`, version 2.1. This document separates the brief's requirements from the collection foundation implemented here. The user subsequently expanded city management to allow editing and adding cities beyond the initial six.

## Data and access requirements

| Requirement                                 | Implementation                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editable cities with local time zones | `cities`: staff can add and edit cities, countries and IANA time zones. Lagos, Accra, Dakar, Abidjan, Kigali and Cape Town are starter data, not an allowed-list restriction.                                                                                                                                                                                              |
| Reusable organisers                         | `organisers`: name, slug, type, website and internal contact group.                                                                                                                                                                                                                                                              |
| Reusable venues tied to one city            | `venues`: name, slug, city, area, address and map URL.                                                                                                                                                                                                                                                                           |
| Named seasons                               | `seasons`: city, dates, description, Provisional/Final status, aliases and inverse event relationship. Admin managed; public release is a separate flag. Dates may be absent while a season is being prepared, but are required before publication.                                                                              |
| Events                                      | `events`: title, slug, city, UTC start/end, all-day, primary and secondary industry, type, access, visibility, external action URL, organiser, venue, multiple seasons, description, publication status, verification, source and private submitter details.                                                                     |
| Fixed controlled vocabularies               | Ten industries, fourteen event types, five access values, three visibility tiers; configured as select fields, not editable taxonomy collections.                                                                                                                                                                                |
| Moderation                                  | Every new event starts Submitted and creates an `event-reviews` record. The queue retains the original listing, AI findings, suggested listing, recommendation, draft message and attributed human decision. AI fields are writable only through trusted server code.                                                            |
| Human approval                              | Reviewer, approver and administrator roles. Approval requires a completed AI review and accepted/amended human recommendation. Only an approver or administrator can approve/publish/cancel/postpone. Private/invitation-only entries also require recorded organiser confirmation.                                              |
| Audit                                       | Event and review versions; approval identity/time, organiser confirmation identity/time, first publication time; editable and versioned `review-settings` global.                                                                                                                                                                |
| Visibility and contact privacy              | Raw events, organisers, venues, seasons and reviews are staff-only. `payload/public-event.ts` is the explicit public projection for future APIs/pages/exports. Never serialize raw Local API records to a public client. It removes internal contacts, unpublished/demo entries and hidden details according to visibility. |
| Cancellation and postponement               | Status edits preserve the event and first publication time. Event deletion through the CMS API is disabled.                                                                                                                                                                                                                      |
| Data validation                             | Chronological end time, HTTP(S) links, maximum 60 description words, city-consistent venues/seasons, different secondary industry, private-submission authority, and held-date/private consistency.                                                                                                                              |

Payload provides authenticated admin screens plus REST and GraphQL for these collections. The public frontend must use a dedicated server query and the safe projection, rather than expose the raw collection API.

The brief has two inconsistencies: the controlled access vocabulary explicitly makes Free links optional, which is used here; “Recommended” belongs to the review workflow, not the five event publication statuses. Public and Industry tiers are interpreted using the brief's proposed beta behaviour; Industry exposes title/time/type/industry/access without venue or organiser. Held dates additionally conceal the real title, description, original slug and season associations.

Changing event content withdraws approval, verification and organiser confirmation and creates a fresh review. Publication is a separate save after approval. An approved listing cannot be silently rewritten. Cancellation/postponement changes alone keep the row eligible for public display.

## Prefilled data

- Six real city lookup records.
- Three unpublished Lagos season shells: Lagos Fashion Week, ART X week, Lagos December. Dates remain empty pending confirmation.
- Review prompt, two-working-day target, and minimum 25 verified upcoming events per city.
- With `npm run seed:demo`: six fictional organisers, six fictional venues, six unpublished demo December seasons and six Submitted, unverified demo events, one per city. Each event creates its own pending review.
- Demo entries are labelled `DEMO`, carry `isDemo`, cannot publish, and never count as verified launch inventory. Sample dates are fixtures, not researched real events. There are no seeded credentials or public user accounts.

The scripts look up stable slugs and preserve existing content. Re-running them does not overwrite editors' changes or create duplicate demo events/reviews. No live emails or AI requests are sent by seeding.

## Commands and database migrations

```sh
npm run payload:types
npm run payload:migrate
npm run seed
npm run seed:demo
npm run test:backend
npx tsc -p tsconfig.backend.json
```

`DATABASE_URL` is the existing Neon connection; `PAYLOAD_SECRET` remains in the environment. The package is configured as ES modules because Payload's CLI and Lexical dependencies require it. Generated migrations cover a fresh database; automatic development schema push is disabled so future schema changes are applied through reviewed migrations.

For the original Users/Media database created with development push, the one-time `payload run scripts/adopt-baseline.ts` command checks baseline column types/nullability, indexes and foreign keys before replacing the development marker with the corresponding migration entry. It does not change users or media. Do not use it to adopt an unrelated database. Thereafter use normal migrations. Existing accounts without an explicit role retain their previous administrator privileges; new additional accounts default to Reviewer, and only administrators can assign roles. The first account created through Payload's first-user setup becomes Administrator.

## Remaining beta implementation

The collection foundation does not itself complete these services and user-facing behaviours:

1. Public submission endpoint/form with validation, abuse protection and enforced `source=submission`; reuse the Event model and queue hook. Never permit callers to choose approval or verification fields.
2. Anthropic worker that processes pending reviews, finds same-city/date clash candidates and organiser/venue matches, snapshots the editable prompt/version/model and writes findings. It must never approve or publish. API credentials and model selection are not configured here; reviews intentionally stay Pending until it is connected.
3. Email adapter plus receipt, request-information/rejection and publication notifications. Payload currently has no email delivery adapter. No messages are sent by this work.
4. Validated CSV import into Submitted events through the Local API so every imported event follows the same review hook; preserve provenance and record per-row failures.
5. Server-rendered List/Day/Week/Month queries on the shared dataset: city, date, multi-industry (including secondary industry), multi-access and season filtering; 14-day list windows, stable pagination, city-local day boundaries and start-time ordering. Scope queries to Published/Cancelled/Postponed, previously published, non-demo records.
6. Public event/season routes using privacy-safe projections, city-local times, ICS downloads, Google Calendar URLs, canonical share links, text-led metadata and Event structured data. Add-to-calendar exports must use the same visibility restrictions.
7. Minimal analytics: page views by city/view/season, outbound action clicks, submissions by status.
8. Real verified launch inventory (minimum 25 upcoming events per city), a named approval owner/deputy, and confirmed season dates in the other five cities. FOLA-seeded real events still require AI review and human approval. Verification must reflect organiser confirmation, not the presence of a seed flag.

Out of beta: ticket transactions, public user accounts, saved events, subscriptions, PDF export, editorial, free-text search, notification products and organiser self-service.

Implementation references: [Payload access control](https://payloadcms.com/docs/access-control/overview), [Local API](https://payloadcms.com/docs/local-api/overview), [migrations](https://payloadcms.com/docs/database/migrations).
