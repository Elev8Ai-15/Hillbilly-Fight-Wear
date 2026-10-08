# HANDOFF: Hillbilly Fight Wear website (hillbillyfightwear.com)
Updated 2026-10-08. Repo `C:\Users\bradg\dev\Hillbilly-Fight-Wear` (GitHub Elev8Ai-15/Hillbilly-Fight-Wear, branch `main`).
Mirror of this file: repo root `HANDOFF.md`. Older history: `notes/hillbilly-chat-build/`, OneDrive-era memory `project_hillbilly_fightwear.md`.

## 1. State in one paragraph
Hono + Cloudflare Pages site (project `hillbilly-fightwear`), Stripe LIVE, Resend, Merica chat agent. 10/08 session fixed the Build Y'Own preview (hoodie backs no longer draw the 3" collar logo, since it prints under the hood; white garments no longer wash out), made the cart thumbnail show the real product photo, and locked two open maintenance endpoints. Everything is committed, pushed and deployed. GitHub was 12 commits behind before this session; it now matches local.

## 2. LIVE
- Hoodie/zip-up back preview: no collar logo; tee/tank/thermal still show it (`692a87b`). **L4**: live /build, real clicks, canvas objects = `["hoodie-black-back.png"]`.
- White garments: 12 transparent images regenerated from the grey shots, `?v=2` cache-buster (`42ee7f4`). **L4**: live hoodie white back, canvas bg `#d5d5d5`, objects `["hoodie-white-back.png?v=2"]`, live PNG corner alpha 0.
- Zip-up print bounds typo fix (`zip-up-hoodie` to `zipup-hoodie`, `692a87b`). **L3**.
- Cart thumbnail = product photo (`4deb624`). **L3** live (tested on local copy: MYOB Hoodie Zip-Up Grey L shows `m1-myob-hoodie-front.webp`).
- `/api/stripe/sync-catalog` + `/api/send-receipt` require header `x-admin-password` (`07a49bd`). **L4**: live unauthenticated POST returns `{"error":"Unauthorized"} [401]`. `ADMIN_PASSWORD` secret confirmed set.
- Checkout, both paths. **L4**: live `/api/shop-checkout` (2 tees) returned `cs_live_a13qvX1t…`; `/api/create-checkout` (hoodie + back graphic) returned `cs_live_b18zam65…`. No payment made.
- 2-for-$50: **L4** on the local copy, cart $60 to $50; server returned `"discount":"10.00","total":"50.00"`.
- Merica: **L4** live, quoted "$65.00 total" and the 3" back-neck logo for a hoodie with a back graphic.

## 3. In flight
- Branch `main`, last commit `42ee7f4`, nothing uncommitted, nothing half-done.

## 4. OWED
- **Brad**: Stripe abandoned-cart toggle + promotions ToS tick (discuss before re-adding `consent_collection`); optional GA4 ID for `src/utils/analytics.ts`.
- **Brian**: returns window, size-chart measurements, "2-for-$50 on custom builds" decision (the cart doesn't apply it to builds; Merica says it doesn't).
- Before the first newsletter send: delete test contact bradgpowell1123+hfwtest@ from Resend audience "HFW Newsletter".

## 5. NEXT
1. Write repo `DEPLOY.md` (deploy command below) so `/ship` works for this repo.
2. Reach L5 on the builder: wait for a real custom order and quote its Stripe line item / receipt email.
3. Optional: white hats (`trucker-hat-white.png` is still opaque white); same script approach if Brad sees them wash out.

## 6. Landmines
- Deploy: `npx --prefix C:\Users\bradg\dev\Hillbilly-Fight-Wear wrangler pages deploy C:\Users\bradg\dev\Hillbilly-Fight-Wear\dist --project-name hillbilly-fightwear --branch main` (run `npm --prefix <repo> run build` first). Wrangler is logged in on the desktop as of 10/08. Never borrow `CLOUDFLARE_API_TOKEN` from another repo's .env; the guard blocks it, correctly.
- On Windows wrangler can print `Assertion failed ... async.c` on exit. Check the log or prod, not the exit text.
- `/images/*` is cached 30 days, immutable. Any image swap needs a new `?v=N` in `src/data/catalog.ts`, or customers keep the old file.
- White garments are GENERATED: edit `scripts/whiten_garments.py` knobs and re-run; don't hand-edit the PNGs.
- The 3" HFW logo prints OUTSIDE on the back collar of every garment. Order text and Stripe say "Back Neck: HFW Logo (3")". Correct, leave it. Hoodies hide it in the preview only.
- 🔴 No payment/checkout param changes without discussing with Brad (8/13 `consent_collection` broke live checkout).
- Secrets (Pages): `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `ADMIN_PASSWORD`. Local `.dev.vars` has no Stripe key (checkout runs in demo mode locally).
- Pillow gotcha: `Image.fromarray(...)` images are read-only; `ImageDraw.floodfill` silently no-ops without `.copy()`.

## 7. Evidence log
No L5 this session (no real customer order exercised the changed paths). Newest L4 quotes:
- Live /build white hoodie back: `{"bg":"#d5d5d5","color":"white","garment":"hoodie","objs":["hoodie-white-back.png?v=2"],"view":"back"}`
- Live: `stripe/sync-catalog: {"error":"Unauthorized"} [401]` · `send-receipt: {"error":"Unauthorized"} [401]`
- Live: `SHOP: cs_live_a13qvX1t` · `BUILDER: cs_live_b18zam65`
- Live /build hoodie black back: `{"canvas":["hoodie-black-back.png"],"garment":"hoodie","view":"back"}`
