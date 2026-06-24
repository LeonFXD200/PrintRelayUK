# Architecture

A developer-facing tour of how PrintRelay UK fits together. The
[README](../README.md) covers the product and how to run it; this doc explains
the code and the decisions behind it.

## The one big idea

The app runs entirely in the browser on **mock data**, but is structured so it
can switch to a real **Supabase** backend *without changing a single component*.

Every read/write goes through two swappable seams:

- [`src/lib/mockDb.js`](../src/lib/mockDb.js) — the data layer.
- [`src/context/AuthContext.jsx`](../src/context/AuthContext.jsx) — authentication.

Each function in those files is `async`, returns plain data, and carries a
comment showing its exact Supabase equivalent. Components only ever call these
functions — they never touch `localStorage` or Supabase directly. So "going
live" means re-pointing those two files; the UI is untouched.

```
Pages / components
        │  (call async functions)
        ▼
mockDb.js  +  AuthContext.jsx     ← the swappable seam
        │
        ├── demo mode → localStorage (default, no config)
        └── live mode → Supabase     (when VITE_SUPABASE_* env vars are set)
```

[`src/lib/supabaseClient.js`](../src/lib/supabaseClient.js) decides which path is
active: if `VITE_SUPABASE_URL` **and** `VITE_SUPABASE_ANON_KEY` are present it
creates a real client and exports `isSupabaseConfigured = true`; otherwise the
app stays in demo mode and makes no network requests at all.

## Boot & routing

1. [`src/main.jsx`](../src/main.jsx) mounts React and wraps everything in:
   - **`HashRouter`** — URLs like `/#/estimator`. Chosen so the app works on
     GitHub Pages (and any static host) with zero server-side redirect config.
   - **`AuthProvider`** — makes the current user available app-wide.
2. [`src/App.jsx`](../src/App.jsx) declares all routes and the `Protected`
   wrapper:
   - Signed-out users hitting a protected route are redirected to `/login`.
   - Non-admins hitting `/admin` are redirected to `/dashboard`.
   - The whole route tree sits inside an `ErrorBoundary`.

| Route | Page | Access |
| --- | --- | --- |
| `/` | Home | public |
| `/estimator` | Estimator | public |
| `/how-it-works`, `/pricing`, `/materials`, `/sellers`, `/faq`, `/terms`, `/contact` | marketing / legal | public |
| `/login`, `/register` | Auth | public |
| `/dashboard` | CustomerDashboard | signed-in |
| `/admin` | AdminDashboard | admin only |
| `*` | NotFound | public |

## Authentication (demo)

[`AuthContext`](../src/context/AuthContext.jsx) validates email/password against
the demo users in [`src/data/users.js`](../src/data/users.js), supports one-click
demo-role login, and persists the signed-in user to `localStorage` so a refresh
stays logged in. It exposes `isAuthed` / `isAdmin` helpers used by the route
guards and navbar. Every method documents the `supabase.auth.*` call that would
replace it.

## Static data — the business knobs

Everything that defines the "business" lives in [`src/data/`](../src/data) so
pricing and options are trivial to tune without touching logic:

| File | What it holds |
| --- | --- |
| `materials.js` | filaments: density (→ grams), cost/kg, difficulty (→ risk), enclosure need, colours |
| `printers.js` | printer profiles: flow rate (→ time), hourly rate, reliability (→ risk) |
| `options.js` | dispatch speeds (urgency multipliers), shipping, layer-height & infill presets |
| `statuses.js` | the job lifecycle; `order` drives the timeline, `tone` drives badge colour |
| `users.js`, `sampleJobs.js` | seed demo accounts, preferences, company info, jobs & estimates |

## The estimator pipeline

The centrepiece. Three stages turn an uploaded file into a price:

```
file ──▶ stl.js ──▶ estimatePrintCost.js ──▶ QuoteBreakdown.jsx
        (parse)      (price + time model)      (render)
                 \
                  └▶ ModelViewer.jsx (three.js live preview)
```

**1. Parse — [`src/utils/stl.js`](../src/utils/stl.js).**
Reads binary *and* ASCII STL, extracts triangle vertices (for rendering),
bounding-box dimensions, and a **real mesh volume** via the signed-tetrahedron
sum (summing the signed volume of the tetrahedron from the origin to each face
gives the enclosed volume of a closed mesh). That real volume is what makes the
estimate meaningful. 3MF/OBJ aren't parsed — volume falls back to a file-size
heuristic, clearly flagged in the UI.

**2. Estimate — [`src/utils/estimatePrintCost.js`](../src/utils/estimatePrintCost.js).**
All tunable constants live in the `PRICING` object at the top. It is a
*transparent approximation, not a slicer*:

- **Material:** `materialFraction = shellAllowance + infill% × (1 − shellAllowance)`,
  then `volume × fraction × density → grams`.
- **Time:** volumetric model — `extruded mm³ / printer flow rate`, slowed by a
  quality factor (finer layers = slower), padded for non-printing moves, ×
  quantity + setup hours.
- **Price:** `material + machine + setup + packaging = subtotal`, then add a
  failure-risk allowance (scales with material difficulty / printer
  reliability), an urgency fee (dispatch speed + urgent toggle), margin and
  shipping; clamped to a minimum order value.

It returns a fully **itemised breakdown** so every line is explainable.

**3. Render.** [`Estimator.jsx`](../src/pages/Estimator.jsx) recomputes the
estimate in a `useMemo` whenever any input changes;
[`QuoteBreakdown.jsx`](../src/components/estimator/QuoteBreakdown.jsx) displays it.

## Resilience & performance choices

- **Code-split 3D viewer.** [`ModelViewer`](../src/components/estimator/ModelViewer.jsx)
  (and three.js) is `React.lazy`-loaded only on the estimator, keeping every
  other page ~123 KB (gzipped) lighter.
- **Error boundaries.** [`ErrorBoundary`](../src/components/ErrorBoundary.jsx)
  wraps the route tree, and a `compact` variant wraps the 3D viewer — a bad
  mesh shows a friendly fallback instead of a blank screen.
- **Privacy-first.** Files are parsed in the browser and never uploaded
  (`file_url` stays `null`); no fonts CDN, analytics or trackers.
- **Persistence.** Demo data lives in `localStorage`; `resetDemoData()` (a
  button on the dashboards) clears it back to the seeds.

## Directory map

```
src/
├── main.jsx              Entry: HashRouter + AuthProvider
├── App.jsx               Routes + Protected route guard
├── context/
│   └── AuthContext.jsx   Demo auth (Supabase-ready signatures)
├── lib/
│   ├── supabaseClient.js Demo vs live switch
│   └── mockDb.js         Async data layer (swap target for Supabase)
├── data/                 Business knobs (materials, printers, options, statuses, seeds)
├── utils/
│   ├── stl.js                STL parser (volume + dimensions)
│   ├── estimatePrintCost.js  Cost + time engine (tunable constants)
│   ├── format.js / colours.js  Display helpers
├── components/
│   ├── layout/   Navbar, Footer, Layout shell
│   ├── ui/       Field, StatusBadge, PageHeader, DemoModeBanner
│   ├── home/     JobStatusPreview (animated hero card)
│   ├── estimator/ ModelViewer (three.js), QuoteBreakdown
│   ├── dashboard/ JobCard
│   └── admin/    StatCard, BarChart, AdminJobRow (editable)
└── pages/        13 routed pages
```

## Going live with Supabase

See the [README's Supabase section](../README.md#-going-live-with-supabase-future)
for the full SQL schema and step-by-step. In short: add the env vars, create the
tables + `print-files` storage bucket, enable Row Level Security, then swap the
function bodies in `mockDb.js` and `AuthContext.jsx` for the Supabase calls each
one already documents.
