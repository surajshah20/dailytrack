# DailyTrack

A personal productivity tracker for planning your day, timing focused work, and reviewing how your plan compared with what you actually did.

You plan tasks with time estimates, run a work timer (or log sessions by hand), write a short end-of-day reflection, and then look back at weekly and monthly reports, a productivity calendar, and your streak.

> **Status:** in active development. The UI has been redesigned to a simple, neutral, light theme (see [Design system](#design-system)).

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Getting started](#getting-started)
5. [Environment variables](#environment-variables)
6. [Database](#database)
7. [Authentication](#authentication)
8. [API reference](#api-reference)
9. [Frontend architecture](#frontend-architecture)
10. [Design system](#design-system)
11. [Business rules](#business-rules)
12. [Scripts](#scripts)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)
15. [Roadmap](#roadmap)

---

## Features

### Dashboard
- Today's snapshot: planned time, time worked, tasks done, and productivity percentage.
- Quick-add a task for today and tick tasks off from the same screen.
- Work timer card showing whether a session is running, with one-click access to the timer.
- Current and longest streak.

### Schedule (daily planning)
- Create, edit, complete, and delete tasks for any day.
- Each task has a title, notes, category, priority (low, medium, high, urgent), optional start and end time, and an estimated duration.
- Day navigation with previous, next, today, and a date picker.
- Progress summary for the selected day.
- Tasks can be recurring (handled by the recurrence service on the server).
- Daily reflection form on the same page.

### Work hours (time tracking)
- Live timer that keeps running while you move between pages.
- Optionally link a session to a task and a category.
- Log a session manually with start and end time; duration is calculated automatically.
- Planned versus actual comparison, including the difference and the share of planned time used.
- Session list for the selected day with delete.

### Daily reflection
- Three prompts per day (what you got done, what got in the way, focus for tomorrow) plus a free-form notes line.
- Saved per date and loaded again when you return to that day.

### Calendar
- Monthly grid with a productivity tier per day: high (80% or more), average (50 to 79%), low (under 50%).
- Shows tasks completed and time worked for each day.
- Click a day to open that day in Schedule.

### Reports
- **Weekly:** tasks completed, time worked versus planned, daily average, best day, planned versus actual hours chart, tasks per day chart, and daily productivity trend.
- **Monthly:** total time worked, tasks completed, daily average, top category, and time by category.

### Streaks
- Current and longest streak, calculated on the server by the streak service.

---

## Tech stack

**Client**

| Area | Choice |
|---|---|
| UI | React 19 |
| Build tool | Vite 8 |
| Routing | react-router-dom 7 |
| Styling | Tailwind CSS 3.4 with CSS-variable design tokens |
| Charts | Recharts 3 |
| Icons | lucide-react |
| HTTP | axios |
| Font | Inter Variable (self-hosted via `@fontsource-variable/inter`) |
| Linting | ESLint 10 |

**Server**

| Area | Choice |
|---|---|
| Runtime | Node.js (ES modules) |
| Framework | Express-style app with routes, controllers, services, and middleware |
| Database | PostgreSQL (Neon in the current setup) via `pg` |
| Auth | JWT, delivered by cookie and by `Authorization: Bearer` header |

---

## Project structure

```
Tracking/
├── client/
│   ├── public/                 favicon, icons, manifest.json
│   ├── src/
│   │   ├── api/                axios client + one module per resource
│   │   │   ├── client.js       axios instance, token header, 401 handling
│   │   │   ├── auth.js
│   │   │   ├── tasks.js
│   │   │   ├── categories.js
│   │   │   ├── sessions.js
│   │   │   ├── reflections.js
│   │   │   ├── calendar.js
│   │   │   └── reports.js
│   │   ├── components/
│   │   │   ├── common/         AuthLayout, Modal, PageHeader, StatCard,
│   │   │   │                   ProgressBar, DateNavigator, PeriodNav,
│   │   │   │                   ProtectedRoute
│   │   │   ├── layout/         AppLayout, Sidebar, BottomNav, navItems.js
│   │   │   ├── reflection/     DailyReflection
│   │   │   ├── schedule/       TaskItem, TaskModal
│   │   │   └── timer/          WorkTimer, ManualSessionModal
│   │   ├── context/            AuthContext, TimerContext
│   │   ├── pages/              Login, Register, Dashboard, Schedule,
│   │   │                       WorkHours, Calendar, Reports
│   │   ├── utils/              dateUtils.js
│   │   ├── App.jsx             routes (one protected layout route)
│   │   ├── main.jsx
│   │   └── index.css           design tokens + component classes
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── vercel.json
│   └── package.json
└── server/
    ├── src/
    │   ├── config/db.js        pg pool (SSL for Neon / production)
    │   ├── controllers/        auth, calendar, category, reflection,
    │   │                       report, session, task
    │   ├── db/
    │   │   ├── migrations/001_initial_schema.sql
    │   │   └── migrate.js
    │   ├── middleware/authMiddleware.js
    │   ├── routes/             one router per resource
    │   ├── services/           recurrenceService.js, streakService.js
    │   ├── utils/jwt.js
    │   ├── app.js              Express app setup
    │   └── server.js           entry point
    └── package.json
```

---

## Getting started

### Prerequisites

- Node.js 20 or newer
- A PostgreSQL database (local, or a hosted one such as Neon)
- npm

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Tracking

cd server && npm install
cd ../client && npm install
```

### 2. Configure the server

Create `server/.env` (see [Environment variables](#environment-variables)):

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=replace-with-a-long-random-string
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Create the tables

```bash
cd server
node src/db/migrate.js
```

### 4. Run both apps

In two terminals:

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000/api

Open the client, create an account on the Register page, and you are in.

---

## Environment variables

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `JWT_SECRET` | Yes | Secret used to sign and verify tokens. If it is missing, login, register, and `/auth/me` fail with a 500. Changing it signs everyone out. |
| `PORT` | No | API port. The client defaults to `5000`. |
| `NODE_ENV` | No | Set to `production` in deployment. Enables SSL to the database. |
| `CLIENT_URL` | Depends on your CORS setup | Allowed browser origin. Use the exact origin of the deployed client in production. |

### Client (`client/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | API base URL. Defaults to `http://localhost:5000/api`. Set it for any deployed build. |

Never commit `.env` files. Keep a `.env.example` with variable names and no values.

---

## Database

- Engine: PostgreSQL.
- Schema: `server/src/db/migrations/001_initial_schema.sql`, applied by `server/src/db/migrate.js`.
- Connection: `server/src/config/db.js` creates a pooled connection (max 10). SSL is enabled when `NODE_ENV=production` or the URL points at Neon.
- Neon note: free-tier databases suspend when idle. The first request after a pause can be slow, so the pool's `connectionTimeoutMillis` should be generous (15 seconds works well).

Tables the application reads and writes, as seen in the controllers:

| Table | Purpose |
|---|---|
| `users` | Accounts (id, email, display name, timezone, created at). |
| `tasks` | Planned tasks per day: title, status, priority, estimate, optional times, category. |
| `categories` | Per-user categories with a name and color. |
| `work_sessions` | Timer and manual sessions with date, duration in seconds, running flag, optional task and category. |
| `reflections` | One reflection per user per day. |
| user settings | Per-user settings returned by `/auth/me`. |

Check the migration file for the exact columns and constraints.

---

## Authentication

- Registration and login return a user and a JWT.
- The server sets a cookie named `dailytrack_token` and also returns the token so the client can store it in `localStorage` (key `dailytrack_token`). This covers mobile browsers and cross-site setups where cookies are blocked.
- Every request from the client sends `Authorization: Bearer <token>` when a token is stored, and `withCredentials: true` so cookies are sent too.
- `authMiddleware.js` tries the Bearer token and the cookie, in that order. A stale cookie does not block a valid Bearer token.
- If the token is invalid or expired the API returns `401`. The client then clears the stored token and the app returns to the login page.
- If the database fails during the user lookup, the API returns `500` instead of `401`, so real server problems are not mistaken for a bad session.
- Frontend routes under the app shell are wrapped by `ProtectedRoute`, which shows a loading state while `/auth/me` is checked and redirects to `/login` when there is no user.

---

## API reference

Base URL: `http://localhost:5000/api`. All routes except register and login require authentication. Responses use this shape:

```json
{ "success": true, "data": { } }
```

Errors use `{ "success": false, "message": "..." }`.

> Paths below follow the client API modules and controllers. Check the route files in `server/src/routes/` for the final source of truth.

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Body: `email`, `password`, `displayName`. Password must be at least 6 characters. |
| POST | `/auth/login` | Body: `email`, `password`. |
| POST | `/auth/logout` | Clears the session cookie. |
| GET | `/auth/me` | Returns the current user and settings. |

### Tasks

| Method | Path | Description |
|---|---|---|
| GET | `/tasks?date=YYYY-MM-DD` | Tasks for a day. |
| POST | `/tasks` | Create a task. Fields: `title`, `description`, `taskDate`, `categoryId`, `priority`, `startTime`, `endTime`, `estimatedMinutes`. |
| PUT | `/tasks/:id` | Update a task. |
| PATCH | `/tasks/:id/status` | Toggle between pending and completed. |
| POST | `/tasks/reorder` | Reorder tasks. |
| DELETE | `/tasks/:id` | Delete a task. |

### Categories

| Method | Path | Description |
|---|---|---|
| GET | `/categories` | The user's categories. |

### Work sessions

| Method | Path | Description |
|---|---|---|
| GET | `/work-sessions?date=YYYY-MM-DD` | Sessions for a day. |
| GET | `/work-sessions/active` | The currently running session, if any. Used by the timer context on load. |
| POST | `/work-sessions/start` | Start the timer. Fields: `taskId`, `categoryId`, `notes`. |
| POST | `/work-sessions/:id/stop` | Stop the running session with that id, with optional `notes`. Returns 404 if that session is not running. |
| POST | `/work-sessions/manual` | Log a session by hand. Fields: `sessionDate`, `taskId`, `categoryId`, `startTime`, `endTime`, `durationMinutes`, `notes`. |
| DELETE | `/work-sessions/:id` | Delete a session. |

### Reflections

| Method | Path | Description |
|---|---|---|
| GET | `/reflections/:date` | Reflection for a day. |
| PUT | `/reflections/:date` | Save a reflection. Fields: `accomplishments`, `challenges`, `tomorrowFocus`, `generalNotes`. |

### Calendar

| Method | Path | Description |
|---|---|---|
| GET | `/calendar?year=YYYY&month=M` | Per-day task and work totals with a `productivityTier` of `high`, `average`, `low`, or `none`. |

### Reports

| Method | Path | Description |
|---|---|---|
| GET | `/reports/dashboard` | Today's summary, streaks, and up to five tasks. |
| GET | `/reports/weekly?startDate=YYYY-MM-DD` | Seven days from `startDate`, with per-day and total figures. |
| GET | `/reports/monthly?year=YYYY&month=M` | Month totals and time by category. |

---

## Frontend architecture

- **Routing:** `App.jsx` defines public routes (`/login`, `/register`) and one protected layout route. `AppLayout` stays mounted while you navigate, so the sidebar and timer state are not recreated. Pages are lazy-loaded, so Recharts is only downloaded when Reports is opened.

  | Path | Page |
  |---|---|
  | `/` | Dashboard |
  | `/schedule` | Schedule (accepts `?date=YYYY-MM-DD`) |
  | `/timer` | Work hours |
  | `/calendar` | Calendar |
  | `/reports` | Reports |

- **State:** two React contexts. `AuthContext` holds the user, settings, and login, register, and logout actions. `TimerContext` holds the active session and elapsed seconds, and syncs with the server on load, so a running timer survives a page refresh.
- **Data fetching:** each page fetches its own data with the modules in `src/api/`. Mutations update local state optimistically where it is safe (toggling and deleting tasks) and refetch on failure.
- **Navigation:** the sidebar (desktop) and bottom bar (mobile) share one list in `components/layout/navItems.js`.
- **Shared pieces:** `Modal` (bottom sheet on mobile, dialog on desktop), `DateNavigator`, `PeriodNav`, `StatCard`, `ProgressBar`, and `PageHeader` are reused by every page.
- **Errors:** pages show a short message when a request fails, instead of failing silently.
- **Accessibility:** labeled form fields, `role="alert"` on errors, `role="checkbox"` on task toggles, `role="progressbar"` on bars, keyboard focus rings, reduced-motion support, and safe-area padding on phones.

---

## Design system

The interface is intentionally plain: one neutral gray scale, one blue accent, one typeface, small radii, and borders instead of heavy shadows.

### Tokens

Colors are CSS variables defined in `src/index.css` as space-separated RGB values, and exposed to Tailwind in `tailwind.config.js` so opacity modifiers work (for example `bg-accent/10`).

| Token | Use |
|---|---|
| `background`, `surface`, `muted` | Page, cards, and subtle fills |
| `border`, `border-strong` | Hairlines and input borders |
| `fg`, `fg-muted`, `fg-subtle` | Primary, secondary, and tertiary text |
| `accent`, `accent-hover`, `accent-subtle`, `accent-fg` | Primary actions, links, focus |
| `success`, `warning`, `danger` (+ `-subtle`) | Meaning only: status, deltas, errors |

A `.dark` class with dark values is already defined, so dark mode can be added later with a toggle that sets `class="dark"` on `<html>`.

### Component classes (in `index.css`)

`.card`, `.label`, `.input`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-icon`, `.badge` (+ `-success`, `-warning`, `-danger`), `.alert-error`, `.link`.

### Rules

- Use semantic tokens (`text-fg-muted`), never raw colors (`text-gray-400`).
- Color means something: success, warning, or danger. Do not use it for decoration.
- No gradients, glows, blur, or large shadows.
- Radii are capped at 12px; most elements use 6 to 8px.
- Use sentence case for labels, with no all-caps tracking.
- Use icons only where they help scanning (navigation, close, delete).

### Legacy aliases

`tailwind.config.js` keeps a block of legacy color aliases (`primary-*`, `surface-elevated`) from before the redesign. Once a search for old classes comes back empty, delete that block:

```bash
grep -rnE "text-white|text-gray-|bg-gray-|border-gray-|primary-|surface-elevated|rose-|emerald-|amber-|indigo-|shadow-2xl|backdrop-blur" client/src --include=*.jsx
```

---

## Business rules

| Rule | Detail |
|---|---|
| Productivity (dashboard) | Minutes worked divided by minutes planned, capped at 100%. 0 when nothing is planned. |
| Productivity (weekly day) | Same formula; if nothing is planned but you worked, the day counts as 100%. |
| Calendar tiers | High is 80% or more, average is 50 to 79%, low is under 50%. |
| Worked time | Sum of session `duration_seconds`, rounded to whole minutes per session. |
| Manual session duration | Calculated from start and end; an end earlier than the start is treated as crossing midnight. |
| Streaks | Calculated by `streakService.js`. A day counts when you complete a task or log a work session. |
| Best day | The day with the most worked minutes in the week. |
| Password | Minimum 6 characters. |

---

## Scripts

### Client (`client/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite on port 5173. |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint. |

### Server (`server/`)

Check `server/package.json` for the exact script names. Typical ones:

| Command | Description |
|---|---|
| `npm run dev` | Start the API with auto-reload. |
| `npm start` | Start the API normally. |
| `node src/db/migrate.js` | Apply the database schema. |

---

## Deployment

- **Client:** `client/vercel.json` is present, so the client is set up for Vercel. Set `VITE_API_URL` to the deployed API URL in the project's environment variables, and keep the SPA rewrite in `vercel.json` so deep links such as `/reports` work after a refresh.
- **Server:** deploy to any Node host (Render, Railway, Fly.io, and similar). Set `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, and `CLIENT_URL`.
- **Cross-site cookies:** if the client and API are on different domains, the cookie needs `SameSite=None; Secure`, and CORS must allow the exact client origin with credentials. The Bearer token in `localStorage` is the fallback that keeps sign-in working when cookies are blocked.
- **Database:** run `node src/db/migrate.js` against the production database once.

---

## Troubleshooting

**Every request returns 401.**
Sign out and sign in again. A token signed with an old `JWT_SECRET` is rejected. If it persists, open DevTools, then Network, and check that the failing request has an `Authorization: Bearer ...` header.

**Login, register, or `/auth/me` return 500.**
Look at the server terminal; the real error is printed there. The usual causes are a missing `JWT_SECRET`, a missing migration (`relation "users" does not exist`), or a database that cannot be reached.

**Quick database check** (from `server/`):

```bash
node --input-type=module -e 'import "dotenv/config"; const {default: pool} = await import("./src/config/db.js"); try { console.log((await pool.query("select now()")).rows) } catch(e) { console.error(e.message) } process.exit()'
```

**The first request after a break is slow or fails (Neon).**
The database was suspended. Retry, and raise `connectionTimeoutMillis` in `db.js` to 15000.

**A warning about `sslmode` appears in the server log.**
It is a notice from the `pg` library. Use `sslmode=verify-full` in `DATABASE_URL` to silence it. It is harmless.

**The timer does not start or does not survive a refresh.**
`/work-sessions/active` is failing. Check the server terminal for that request's error.

**The UI is dark or text is invisible.**
`tailwind.config.js` is the old version. The new one defines colors such as `fg` and `surface` from CSS variables. Replace it, then restart `npm run dev`.

**`text-fg does not exist` build error.**
Same cause: the Tailwind config does not define the new color names. Restart the dev server after replacing it.

**Dates are off by one early in the morning.**
The dashboard endpoint calculates "today" in UTC. See the roadmap item on time zones.

---

## Roadmap

- Pass the client's local date to the dashboard endpoint so "today" respects the user's time zone.
- Dark mode toggle (tokens already exist).
- Replace `window.confirm` on deletes with a small confirmation dialog.
- Category management screen (create, rename, recolor, delete).
- Per-task time totals from linked sessions.
- Data export (CSV).
- Tests for the report and streak calculations.
- A `.env.example` for both apps.

---

## License

Add a license of your choice (for example MIT) before making the repository public.