## Roadmap

### Current State

- Authentication with Supabase is integrated (`AuthProvider`, auth pages).
- Prisma schema covers users, seller profiles, workflows, versions (JSON), categories, tags, orders, payments, favorites, reviews, payouts, reports, and audit logs.
- Public Marketplace implemented: listing with filters/sorting (`/marketplace`, `GET /api/marketplace/workflows`).
- Public Workflow detail with JSON n8n preview and version info (`/workflow/[id]`, `GET /api/marketplace/workflows/[id]`).
- Public Store page (`/store/[slug]`, `GET /api/store/[slug]`).
- Seller APIs for creating/updating/deleting workflows and creating seller profile (`/api/seller`, `/api/workflows`, `/api/workflows/[id]`).
- Versioning utilities for workflow JSON (`src/lib/workflow-version.ts`).

### Milestones

#### M1 — Hygiene and Consistency

- Ensure all API response messages are in English.
- Centralize BigInt → string serialization for API responses.
- Add shared Zod schemas/types in `src/types/` and use `import type` consistently.
- Verify `middleware.ts` guards for dashboard/seller routes.

#### M2 — Seller Onboarding and Complete CRUD

- Build UI for Become Seller (`/become-seller`) wired to `POST /api/seller` with validations.
- Seller Dashboard (`/dashboard/seller`):
  - List seller workflows via `GET /api/workflows`.
  - Create/Edit workflow page: titles, descriptions, price, status, image, JSON n8n (using `json-input.tsx` + `workflow-preview.tsx`).
  - Versioning: on JSON update, call `updateWorkflowVersion`.
  - Status management: publish/unlist/disable.
- Categories & Tags:
  - In seller UI: assign existing categories/tags via multi-select (read from `Category`, `Tag`).
  - Add API to link/unlink categories/tags for a workflow.

#### M3 — One‑Time Pricing Plans

- Enable `PricingPlan` management in seller UI (CRUD: name, priceCents, features, sortOrder, isActive).
- Add seller endpoints for plans.
- Expose active plans on public workflow detail (already partially included in marketplace detail API).

#### M4 — Favorites (Wishlist)

- API: `POST/DELETE /api/favorites`, `GET /api/favorites` for current user.
- Wire heart buttons in `/marketplace` and `/workflow/[id]` with optimistic updates.
- Include `isFavorite` when authenticated.

#### M5 — Checkout and Payments (Stripe)

- `POST /api/checkout/session`:
  - Inputs: `workflowId`, optional `pricingPlanId`.
  - Create `Order` (pending) + Stripe Checkout Session, return `url`.
- Webhook `POST /api/webhooks/stripe`:
  - Handle `checkout.session.completed`, `charge.refunded`.
  - Update `Order.status`, create `Payment`, `OrderItem`s, set `paidAt`, increment `salesCount`.
- UI: Purchase button triggers checkout; success/failure pages.

#### M6 — Delivery and “My Purchases”

- API `GET /api/orders` for buyer history.
- API `GET /api/orders/[id]/download` with access control (paid owner) serving latest `versions.jsonContent` as `.json`.
- UI `/dashboard/purchases`: purchases list, Download button, simple invoice.

#### M7 — Reviews & Ratings

- API:
  - `POST /api/reviews` (enforce buyer-only, unique per user/workflow).
  - `GET /api/reviews?workflowId=...` (public).
  - `PUT /api/reviews/[id]` (edit own review), moderation via `status`.
  - Maintain `Workflow.ratingAvg` and `ratingCount` transactionally.
- UI:
  - Reviews tab on workflow detail (form if purchased; list).
  - Seller Dashboard: view reviews for own workflows.

#### M8 — Advanced Search and Pagination

- Implement real pagination on marketplace UI (API already supports it).
- Persist filters via querystring; add multi-category, tag filters.

#### M9 — Asset and Image Uploads

- Integrate Supabase Storage (or UploadThing) for `heroImageUrl`.
- Add uploader UI with validations; store public URLs.

#### M10 — Reporting and Moderation

- API `POST /api/reports` (reason, `workflowId`, optional reporter).
- Admin APIs `GET/PUT /api/admin/reports` to manage statuses.
- UI: “Report this workflow” on detail; simple Admin dashboard to triage.

#### M11 — Payouts (Seller Earnings)

- Scheduled job (Vercel Cron) to aggregate monthly sales per seller and create `Payout` (pending).
- Admin UI: mark payouts as paid, set `providerBatch`, export CSV.
- Seller Dashboard: Payouts history and status.

#### M12 — Audit Log and Analytics

- Record `AuditLog` on key actions (publish, price change, refund, payout paid).
- Seller analytics: sales by workflow, revenue, top products.

#### M13 — Security, Compliance, Robustness

- Rate limiting on sensitive/public endpoints.
- Strict Zod validation across APIs; clear English error messages.
- Access control checks: owner-only on seller APIs; buyer-only on downloads/reviews.
- Structured error logging; avoid leaking PII.
- If adding Supabase row reads later, ensure proper RLS policies (Prisma is primary now).

#### M14 — SEO and Performance

- Complete meta/OG per page, add `sitemap.xml` and `robots.txt`.
- Add JSON‑LD structured data for workflows.
- Optimize images with `next/image`, lazy loading, bundle splitting.
- Cache strategy for public pages (ISR/revalidate) where appropriate.

#### M15 — Transactional Emails

- Integrate email provider (Resend/Postmark) for:
  - Purchase confirmation (with download link).
  - Review notifications.
  - Payout paid notifications.
- Handle Stripe refund events → notify buyer.

#### M16 — Tests and Quality

- Unit tests for libs/utils/formatters.
- API tests for key routes.
- E2E with Playwright for purchase → download → review.
- Enforce ESLint/Prettier; CI checks.
- Realistic seed data for demo.

#### M17 — Deployment and Ops

- CI/CD with Prisma migrate deploy.
- Configure env vars on Vercel (Supabase, Stripe, webhook secret).
- Sentry/Logtail integration for monitoring.
- Runbooks: refunds, cache invalidation, key rotation.

#### M18 — Nice‑to‑Have (Post‑MVP)

- Workflow bundles, coupons/discounts.
- Recommendations/similar items.
- i18n content (keep English default).
- Import via file with advanced validation.
- Version diffing and changelog UI.

### Milestone Deliverables (Quick View)

- M2: Seller CRUD complete + categories/tags assignment.
- M5–M6: Stripe checkout live + delivery + Purchases.
- M7: Reviews end‑to‑end.
- M9: Stable image uploads.
- M11: Administered payouts.
- M13–M16: Hardening, SEO, tests, CI/CD.
