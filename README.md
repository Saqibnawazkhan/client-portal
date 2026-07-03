# Orbit · Client Portal

A polished, production-ready React rebuild of the Orbit client onboarding portal.
*Engineered for the Future. Built for Today.*

A guided, 4-phase onboarding experience with a matching admin pipeline — reimagined
with a proper design system, smooth motion, real icons, and a fully typed state layer.

---

## Highlights

- **Design system first** — CSS custom-property tokens for color, radius, shadow, and
  motion in [`src/styles/global.css`](src/styles/global.css). Consistent buttons, cards,
  badges, and form controls everywhere.
- **Two experiences, one app**
  - **Client** — welcome hero with a live progress ring, a sticky 4-step tracker, and a
    context-aware "current phase" card that changes with status (open / submitted / complete).
  - **Admin** — pipeline dashboard with live stats + activity feed, and a per-client detail
    view to review submissions, lock/unlock phases, and approve to open the next one.
- **The four phases**
  1. Onboarding · 2. Project Requirements (with add/remove requirement rows) ·
  3. Contract & Invoice (12-clause agreement + itemised invoice) · 4. Thank You.
- **Motion & polish** — page transitions and micro-interactions via Framer Motion,
  crisp [lucide](https://lucide.dev) icons instead of emoji chrome, animated progress ring
  and status pulses.
- **Persistent & typed** — all state lives in a typed reducer + Context and is saved to
  `localStorage`, so refreshes keep your place. Fully responsive and accessible-minded.

## Tech stack

React 18 · TypeScript (strict) · Vite · Framer Motion · lucide-react · plain modern CSS.

## Getting started

> This machine runs Node via **nvm**. Activate it first, then use npm as usual.

```bash
# from this folder: orbit-portal/
nvm use 20            # or: export PATH="$HOME/.nvm/versions/node/v20.20.0/bin:$PATH"

npm install           # already run once — safe to repeat
npm run dev           # start the dev server → http://localhost:5173
npm run build         # type-check + production build into dist/
npm run preview       # serve the production build locally
```

## Project structure

```
src/
├─ main.tsx                     App entry
├─ App.tsx                      View router (client landing / phase / admin)
├─ types.ts                     Domain types
├─ styles/global.css            Design tokens + base + shared component styles
├─ data/
│  ├─ phases.ts                 Phase metadata, status info, copy
│  └─ seed.ts                   Demo clients, activity, generators
├─ store/
│  ├─ portalReducer.ts          Actions + reducer + helpers
│  └─ PortalContext.tsx         Provider, hook, localStorage persistence
└─ components/
   ├─ TopBar.tsx                Brand + sliding role switch + reset
   ├─ ui/                       Logo, Badge, Field primitives
   ├─ client/                   Landing, Stepper, Phase 1–4 screens
   └─ admin/                    Dashboard + client detail
```

## Try it

- Toggle **Client / Admin** in the top-right to switch experiences.
- As **Admin**, open a client with an orange dot (a submission is waiting), then
  **Approve** a phase — the client's next phase unlocks and a banner appears on their portal.
- **Reset demo** restores the starting data at any time.
