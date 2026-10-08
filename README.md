# Pigeon

Pigeon is a fuel-station operations app for a network of stations across Nigeria. Directors oversee stations and the managers who run them; managers record each trading day's pump meters and reservoir levels; everyone sees how much fuel the tanks gave up against how much the pumps actually sold.

This repository is the Angular frontend. It talks to the NestJS backend in the sibling `../backend` folder.

## What it does

Access is by role. Each role lands in its own shell with its own drawer.

**Admin** (`/admin`)
- Dashboard with user and support-ticket counts.
- Users Management: all accounts as a table, add users via a modal (admins can create any role, directors only managers).
- Managers: manager-only table, details page, assign or unassign a station.
- Stations: searchable table, add-station modal, station details with manager assignment, prices, pumps, reservoirs and daily sales records.
- Support Tickets: list, status filters, create via modal, inline status changes.

**Director** (`/director`)
- Dashboard: station counts (active, under maintenance, inactive), manager coverage (assigned, unassigned) and a daily sales chart filtered by date range and station.
- Stations and Managers, as above.

**Manager** (`/manager`)
- My Station: status of the assigned station, today's record status, prices, pumps and reservoirs. Shows "No station assigned" until a director assigns one.
- Daily Sales: record the day in a modal (opening and closing meter per pump, opening, delivered and closing level per reservoir), with expected versus actual sales computed live. Past days are listed and expandable per product and per pump.

Every station stocks petrol, diesel and kerosene, priced in Naira per litre. Expected litres for a product come from its reservoir (opening + delivered − closing); actual litres come from the pump meters (closing − opening). The variance between the two is shown per pump, per product and per day.

## Stack

- Angular 21 with NgModules, signals and the new control flow.
- `@ngrx/signals` for all state. Every feature has a `signalStore`; services are HTTP-only.
- Chart.js via ng2-charts for the sales chart.
- Tailwind 4 is wired through PostCSS; most styling is hand-written CSS using the tokens in `styleguide.md`.
- Vitest for unit tests.
- Firebase Hosting for deployment (`firebase.json`, project `pigeon-001`).

## Getting started

Prerequisites: Node 20 or newer and npm.

1. Start the backend first:

   ```bash
   cd ../backend
   npm install
   npm run start:dev
   ```

   It listens on `http://localhost:3000` and serves Swagger at `/api/docs`. On first run it creates `pigeon.sqlite` and seeds development data: three accounts, six stations, prices, pumps, reservoirs and about 90 days of daily records.

2. Start the frontend:

   ```bash
   npm install
   npm start
   ```

   Open `http://localhost:4200`.

### Development seed accounts

| Username   | Password   | Role     |
| ---------- | ---------- | -------- |
| `admin`    | `password` | admin    |
| `director` | `password` | director |
| `manager`  | `password` | manager  |

The login page shows these only in development builds. Override the seed password with `SEED_PASSWORD` in the backend `.env`.

### Configuration

The API base URL lives in `src/environments/`:

- `environment.development.ts` → `http://localhost:3000` (used by `ng serve`)
- `environment.ts` → production URL (used by `ng build`)

Backend settings are in `../backend/.env`: `PORT`, `JWT_SECRET` (required in production), `JWT_EXPIRATION`, and optional `SEED_PASSWORD`.

## Scripts

| Command         | What it does                                   |
| --------------- | ---------------------------------------------- |
| `npm start`     | Dev server with live reload                    |
| `npm run build` | Production build to `dist/pigeon`              |
| `npm run watch` | Development build that rebuilds on change      |
| `npm test`      | Unit tests with Vitest                         |

Deploy with `firebase deploy` after a production build; the hosting config rewrites every route to `index.html`.

## Project layout

```
src/app/
  auth/               login, AuthStore, JWT interceptor, route guards
  dashboard/          generic post-login dashboard
  users/
    admin/            admin shell: navbar, drawer, dashboard
    director/         director shell and dashboard (sales chart)
    manager/          manager shell: My Station, Daily Sales
  users-management/   users table, details, add-user modal
  managers/           managers table, details, assign-station modal
  stations/           stations table, details, add-station, assign-manager,
                      add-pump, add-reservoir modals; equipment store
  sales/              sales summary store (chart), daily sales store,
                      shared daily report, records list and record modal
  tickets/            support tickets list and add-ticket modal
  theme.service.ts    light/dark theme
src/styles.css        design tokens plus shared modal, table, badge and stat-card styles
styleguide.md         colour, type and component guidance
```

Each feature folder follows the same shape: `models/`, `services/` (HTTP only), `store/` (signal store), `components/`, and a lazy NgModule with its own routing.

## Conventions

- **State lives in signal stores.** Components inject a store and read its signals; async work goes through `rxMethod`. Do not put `signal()` state or `subscribe()` calls in components or services.
- **"Add" screens are modals.** Any component that creates something opens as a modal driven by its feature store (`isAddXModalOpen`, `openAddXModal()`, `closeAddXModal()`), closes on backdrop click and on success.
- **Auth is centralised.** `AuthStore` owns the session, `authInterceptor` adds the bearer token and logs out on 401, `authGuard` protects routes and checks `data.roles`.
- **Shared visuals are global.** Modal, data-table, status badge and stat-card styles live in `src/styles.css`; feature stylesheets only add layout.
- **Role rules are enforced by the backend.** The UI hides what a role cannot do, but the API is the source of truth.

## Backend API in brief

All routes except `POST /auth/login` require a bearer token.

| Area      | Routes                                                                                   |
| --------- | ---------------------------------------------------------------------------------------- |
| Auth      | `POST /auth/login`                                                                       |
| Users     | `GET/POST /users`, `GET /users/:id`                                                      |
| Managers  | `GET/POST /managers`, `GET/DELETE /managers/:id` (delete deactivates)                    |
| Stations  | `GET/POST /stations`, `GET /stations/stats`, `GET /stations/mine`, `GET/PATCH /stations/:id` |
| Equipment | `GET /stations/:id/prices`, `PUT /stations/:id/prices/:product`, `GET/POST /stations/:id/pumps`, `PATCH /pumps/:id`, `GET/POST /stations/:id/reservoirs`, `PATCH /reservoirs/:id` |
| Sales     | `GET /sales/summary`, `GET/POST /sales/daily`, `GET /sales/daily/template`, `GET/PUT /sales/daily/:id` |
| Tickets   | `GET/POST /tickets`, `GET /tickets/stats`, `GET/PATCH /tickets/:id`                      |

Full request and response shapes are in Swagger at `http://localhost:3000/api/docs` while the backend runs.
