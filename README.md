# SiteOps — Site Operations Dashboard

A full-stack dashboard for managing operational sites, tracking installation work, and reviewing live summary metrics.

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-ES_modules-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-334155)](#deployment)

## Live Demo

| Service | URL |
|---|---|
| Frontend | [site-operations-dashboard-tau.vercel.app](https://site-operations-dashboard-tau.vercel.app/) |
| Backend API | [site-operations-api-iwwx.onrender.com](https://site-operations-api-iwwx.onrender.com/) |
| API health check | [GET /api/health](https://site-operations-api-iwwx.onrender.com/api/health) |
| GitHub repository | [GodsonArockiaRaj007/site-operations-dashboard](https://github.com/GodsonArockiaRaj007/site-operations-dashboard) |

The deployed frontend and read-only API endpoints were checked while preparing this README. Live records and summary values can change as the database is updated.

## Overview

SiteOps is a React single-page application backed by an Express REST API and PostgreSQL. It provides operational views for sites and installation activities. The frontend requests operational data from the API; site and installation records are persisted in PostgreSQL.

## Key Features

### Dashboard

- Live summary cards for total sites, active sites, total installations, and completed installations.
- Installation status counts and percentage progress bars.
- A recent-installations table with site, activity, scheduled date, and status.
- Loading and API-error states.

### Sites

- Site listing with search across site name, location, status, and creator.
- Client-side status filtering.
- Create, edit, and delete actions.
- Status badges and creator display.
- New sites are assigned to the configured demo creator user with ID `1` (Godson Raj). This is a fixed default, not authenticated user attribution.

### Installations

- Installation listing with client-side search and status filtering.
- Create, edit, and delete actions.
- Site selection, activity type, status, scheduled date, completed date, and notes in the form.
- Site location and assigned technician are shown when returned by the API. The installation form does not currently provide technician assignment.

The interface uses responsive navigation and horizontally scrollable tables on narrow screens. Search and filtering are performed in the browser using the records returned by the API.

## Screenshots

Add screenshots from the deployed application here.

Recommended captures:

- Dashboard
- Sites
- Installations

## Architecture

```text
GitHub
   ├──→ Vercel
   │      └── React + Vite frontend
   │                 │
   │                 └── HTTPS API requests
   │
   └──→ Render
          └── Node.js + Express API
                    │
                    ▼
             Neon PostgreSQL
```

## Technology Stack

| Area | Technologies used |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS, Axios, Lucide React |
| Backend | Node.js, Express, `pg` (node-postgres), CORS, dotenv, Morgan |
| Database | PostgreSQL, hosted on Neon |
| Hosting | Vercel (frontend), Render (backend), Neon (database) |
| Source control | Git, GitHub |

The frontend dependencies and scripts are listed in `frontend/package.json`; backend dependencies and scripts are in `backend/package.json`.

## Database Schema

The repository contains [`neon_migration.sql`](./neon_migration.sql), a PostgreSQL 18.6 database dump containing the schema and a snapshot of data. The runtime backend connects to the configured PostgreSQL database using `DATABASE_URL`.

### Tables

| Table | Columns and database types |
|---|---|
| `users` | `id INTEGER` (primary key, sequence-backed); `name VARCHAR(100) NOT NULL`; `email VARCHAR(150) NOT NULL UNIQUE`; `role VARCHAR(50) NOT NULL DEFAULT 'technician'`; `created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP` |
| `sites` | `id INTEGER` (primary key, sequence-backed); `name VARCHAR(150) NOT NULL`; `location VARCHAR(255) NOT NULL`; `status VARCHAR(50) NOT NULL DEFAULT 'pending'`; `created_by INTEGER` (nullable foreign key); `created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP` |
| `installations` | `id INTEGER` (primary key, sequence-backed); `site_id INTEGER NOT NULL` (foreign key); `assigned_to INTEGER` (nullable foreign key); `activity_type VARCHAR(100) NOT NULL`; `status VARCHAR(50) NOT NULL DEFAULT 'pending'`; `scheduled_date DATE`; `completed_date DATE`; `notes TEXT`; `created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP` |

There are no database `CHECK` constraints for the status strings in the included dump; allowed site and installation statuses are checked by backend validation middleware.

### Database Relationships

```text
users (id)
  ├── 1:N ── sites (created_by)
  └── 1:N ── installations (assigned_to)

sites (id)
  └── 1:N ── installations (site_id)
```

- `sites.created_by` references `users.id`.
- `installations.assigned_to` references `users.id`.
- `installations.site_id` references `sites.id` with `ON DELETE CASCADE`.
- The `created_by` and `assigned_to` foreign keys have no explicit delete action in the dump, so PostgreSQL applies its default `NO ACTION` behavior.

### Database Normalization

The dump separates users, sites, and installation records into their own tables. Relationships are represented with foreign keys, and installation/site results join related names at read time rather than storing duplicate copies of user or site names in installation rows.

### SQL Joins and Aggregations

- Site list and detail queries use `LEFT JOIN users` to include the creator's name while retaining sites whose `created_by` is null.
- Installation list and detail queries join `sites` for the site's name/location and use `LEFT JOIN users` for the assigned technician's name.
- The summary endpoint uses scalar `COUNT(*)` subqueries for total/active sites and total/completed/pending/in-progress installations. It does not use `GROUP BY`.
- List queries order records by descending ID. Single-record reads and updates/deletes use parameterized ID predicates.

### Database Indexes

The included database dump defines B-tree indexes on:

- `sites.location`
- `sites.status`
- `installations.site_id`
- `installations.assigned_to`
- `installations.status`

Primary keys and the unique constraint on `users.email` also create their corresponding indexes. These indexes are available to PostgreSQL for matching lookups and joins; no `EXPLAIN ANALYZE` results or measured performance claims are included here.

## REST API

The API is mounted under `/api`. The backend is hosted at `https://site-operations-api-iwwx.onrender.com`; locally, the default port is `5000`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | API health response |
| `GET` | `/api/db-test` | Tests database connectivity and returns database time |
| `GET` | `/api/sites` | Lists sites, including creator names |
| `POST` | `/api/sites` | Creates a site |
| `GET` | `/api/sites/:id` | Reads one site, including creator name |
| `PUT` | `/api/sites/:id` | Updates a site's name, location, and status |
| `DELETE` | `/api/sites/:id` | Deletes a site |
| `GET` | `/api/installations` | Lists installations with site and assigned-user names |
| `POST` | `/api/installations` | Creates an installation |
| `GET` | `/api/installations/:id` | Reads one installation with related site/user names |
| `PUT` | `/api/installations/:id` | Updates an installation |
| `DELETE` | `/api/installations/:id` | Deletes an installation |
| `GET` | `/api/summary` | Returns aggregated site and installation counts |

### Create a site

`POST /api/sites`

```json
{
  "name": "North Ridge Facility",
  "location": "Chennai",
  "status": "active"
}
```

The backend assigns `created_by` to demo user ID `1`; clients do not supply a creator name or ID. A successful create returns HTTP `201` and the inserted row. Since the insert uses `RETURNING *`, `data.created_by` in that response is the numeric user ID. The site list/detail queries join `users`, so their `created_by` value is the user's display name.

Example create response (timestamps and generated IDs vary):

```json
{
  "success": true,
  "message": "Site created successfully",
  "data": {
    "id": 12,
    "name": "North Ridge Facility",
    "location": "Chennai",
    "status": "active",
    "created_by": 1,
    "created_at": "2026-10-08T20:11:20.739Z"
  }
}
```

Example list response:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "name": "North Ridge Facility",
      "location": "Chennai",
      "status": "active",
      "created_at": "2026-10-08T20:11:20.739Z",
      "created_by": "Godson Raj"
    }
  ]
}
```

### Create an installation

`POST /api/installations`

```json
{
  "site_id": 1,
  "assigned_to": 3,
  "activity_type": "Equipment installation",
  "status": "pending",
  "scheduled_date": "2026-11-15",
  "completed_date": null,
  "notes": "Coordinate site access before arrival."
}
```

`assigned_to`, dates, and notes can be omitted or null. The site must exist. The list endpoint returns `{ "success": true, "count": ..., "data": [...] }`; each row includes `site_id`, `site_name`, `site_location`, and the assigned user's name as `assigned_to` (or null).

Example `GET /api/installations` response:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 11,
      "site_id": 11,
      "activity_type": "Equipment Installation",
      "status": "in_progress",
      "scheduled_date": "2026-10-21T00:00:00.000Z",
      "completed_date": null,
      "notes": null,
      "created_at": "2026-10-08T18:13:17.728Z",
      "site_name": "Tirunelveli Branch Site",
      "site_location": "Tirunelveli",
      "assigned_to": null
    }
  ]
}
```

### Summary response

`GET /api/summary`

```json
{
  "success": true,
  "data": {
    "totalSites": 8,
    "activeSites": 3,
    "totalInstallations": 10,
    "completedInstallations": 3,
    "pendingInstallations": 4,
    "inProgressInstallations": 3
  }
}
```

Counts shown above reflect a read of the live API when this README was prepared; they are examples, not fixed values.

### Errors

Validation failures return HTTP `400`; missing resources return `404`; handled database/controller failures return `500`. JSON errors use this general shape:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

Unknown routes are forwarded to the central Express error handler with status `404`. The `ApiError` class exists in the backend, but the current controllers primarily return errors directly or set `statusCode` on the unknown-route error.

## Validation

Validation middleware is applied to site and installation create/update routes.

**Sites**

- Requires a non-empty name and location.
- If a status is supplied, it must be `pending`, `active`, or `completed`.
- The update controller also requires a status.

**Installations**

- Requires a site ID that converts to an integer and a non-empty activity type.
- If supplied, status must be `pending`, `in_progress`, or `completed`.
- If supplied, scheduled and completed dates must be parseable dates.
- The controller checks that the referenced site exists.

## Error Handling

- Validation middleware returns a JSON error with status `400`.
- Controllers return `404` for missing site/installation resources (and for a nonexistent site selected for an installation).
- Controller failures return a JSON `500` response with a generic message; details are written to the server console.
- Unknown routes are forwarded to the central error handler, which uses `err.statusCode` or defaults to `500`.
- The frontend displays loading, success, empty, and API-error states. It logs caught API errors to the browser console.

## Logging

The Express server uses Morgan's `dev` format for HTTP request logs. Controllers also use `console.error` when requests fail. Request logging provides a basic record of incoming requests and their responses during server operation.

## Project Structure

```text
site-operations-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── installationController.js
│   │   │   ├── siteController.js
│   │   │   └── summaryController.js
│   │   ├── middleware/
│   │   │   ├── ApiError.js
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── routes/
│   │   │   ├── installationRoutes.js
│   │   │   ├── siteRoutes.js
│   │   │   └── summaryRoutes.js
│   │   └── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Installations.jsx
│   │   │   └── Sites.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── .oxlintrc.json
│   ├── vite.config.js
│   └── .gitignore
├── neon_migration.sql
├── .gitignore
└── README.md
```

## Environment Variables

The backend reads `PORT` and `DATABASE_URL`. The frontend reads `VITE_API_URL`.

**`backend/.env`**

```dotenv
PORT=5000
DATABASE_URL=your_postgresql_connection_string
```

**`frontend/.env`**

```dotenv
VITE_API_URL=http://localhost:5000/api
```

For the deployed frontend, configure `VITE_API_URL` in the frontend hosting environment to point to the deployed API base URL ending in `/api`.

> Do not commit `.env` files. Never put database credentials or other secrets in this README or in frontend variables. `VITE_` variables are included in the browser bundle and must not contain secrets.

## Local Development

### Prerequisites

- Node.js and npm
- Access to a PostgreSQL database (local PostgreSQL or Neon)

### 1. Clone the repository

```bash
git clone https://github.com/GodsonArockiaRaj007/site-operations-dashboard.git
cd site-operations-dashboard
```

### 2. Prepare PostgreSQL

The tracked `neon_migration.sql` file is a PostgreSQL dump containing table definitions, constraints, indexes, and a data snapshot. For a fresh development database, apply it with `psql` (PowerShell):

```powershell
$env:DATABASE_URL = "your_postgresql_connection_string"
psql "$env:DATABASE_URL" -f .\neon_migration.sql
```

Use a fresh database for this dump; it is not an incremental migration. It contains sample user and operational records. Do not apply it to a database whose data must be preserved.

### 3. Install and configure the backend

```bash
cd backend
npm install
```

Create `backend/.env` with the backend variables shown above, then start the API:

```bash
npm run dev
```

The server defaults to `http://localhost:5000`. Its API health endpoint is `http://localhost:5000/api/health`.

### 4. Install and configure the frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env` with `VITE_API_URL=http://localhost:5000/api`, then start Vite:

```bash
npm run dev
```

Open the local URL printed by Vite. To create a production bundle, run `npm run build` from `frontend/`. The frontend also provides `npm run lint`.

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon PostgreSQL

Azure deployment was not used because an Azure subscription was unavailable during the evaluation. The application is deployed using equivalent cloud services: Vercel for the frontend, Render for the backend, and Neon PostgreSQL for the database.

Set `VITE_API_URL` in the Vercel project to the backend API base URL ending with `/api`. Configure `PORT` (as supplied by the host) and `DATABASE_URL` in Render's environment settings. Database credentials should only be configured on the backend host.

## Security

- The backend reads its database connection string from `DATABASE_URL`.
- SQL values are passed as parameters in the database queries.
- Request bodies are validated for required fields, supported statuses, numeric site IDs, and parseable dates.
- Backend and frontend `.gitignore` files exclude local `.env` files.
- The application does not currently implement authentication, authorization, or user-specific identity. New sites use demo user ID `1` as the creator.
- Express currently installs CORS using `cors()` without an origin allowlist; production deployments should restrict allowed origins as appropriate.

## Technical Evaluation Coverage

| Requirement | Current implementation |
|---|---|
| React.js frontend | React and Vite single-page application |
| Dashboard and summary cards | Dashboard consumes live `/api/summary` and `/api/installations` data |
| Responsive UI | Responsive shell, forms, and horizontally scrollable tables |
| Site listing, search, filtering, and forms | Sites page supports search, status filtering, create, edit, and delete |
| Installation tracking and forms | Installations page supports search, status filtering, create, edit, and delete |
| React Hooks and REST integration | React state/effect hooks and Axios service |
| Node.js REST backend | Express routes and controllers |
| Site and installation CRUD | GET, POST, PUT, and DELETE routes, plus GET by ID |
| PostgreSQL relationships | `users`, `sites`, and `installations` tables with primary and foreign keys |
| SQL joins | Site/user and installation/site/user joins |
| SQL aggregations | Summary endpoint uses `COUNT(*)` subqueries |
| Indexes | Location, status, and installation foreign-key indexes are defined in the database dump |
| Validation and errors | Validation middleware, controller responses, and central Express error handler |
| Logging | Morgan request logging and controller error logging |
| Git/GitHub | Repository is hosted on GitHub |
| Cloud deployment | Vercel, Render, and Neon; not Azure |

No automated test script is currently defined in either package manifest. The database dump includes indexes, but no query-plan measurements are documented.

## Future Improvements

The following are not currently implemented:

- Authentication and role-based authorization
- User-selectable creator/technician assignment
- Server-side pagination and filtering
- Automated backend and frontend tests
- CI/CD checks
- Audit logging
- Azure deployment, if an Azure subscription becomes available

## Author

[GodsonArockiaRaj007](https://github.com/GodsonArockiaRaj007)
