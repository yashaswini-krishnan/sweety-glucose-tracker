# Sweety Glucose Tracker

Sweety is a blood glucose tracker for recording daily readings and reviewing daily, month-to-date, and monthly summaries. The project has a REST API and a browser-based React client.

## Tech stack

- Node.js and Express
- PostgreSQL
- React and Vite
- Axios and React Router

## Prerequisites

- Node.js and npm
- PostgreSQL

## Setup

1. Install dependencies in both projects:

   ```text
   cd server
   npm install
   cd ../client
   npm install
   ```

2. Create development and test databases in PostgreSQL:

   ```sql
   CREATE DATABASE sweety;
   CREATE DATABASE sweety_test;
   ```

3. From the repository root, copy the example environment files:

   ```text
   Copy-Item server\.env.example server\.env
   Copy-Item client\.env.example client\.env
   ```

   Update `server/.env` for your local PostgreSQL connection. Set `DATABASE_URL` to the development database and `TEST_DATABASE_URL` to the separate test database. Set `JWT_SECRET` to a long, random value. The test suite clears test tables, so do not point `TEST_DATABASE_URL` at your development database.

   `client/.env.example` uses the server's default local port. If you change the server port, update `VITE_API_URL` to match; it must include `/api`.

4. Run the database migration from the server directory:

   ```text
   cd server
   npm run db:migrate
   ```

## Running the project

Run these commands in separate terminals:

```text
cd server
npm run dev
```

```text
cd client
npm run dev
```

To run the server tests:

```text
cd server
npm test
```

To build the client:

```text
cd client
npm run build
```

To load demo data after migrating the database:

```text
cd server
npm run seed
```

Demo login: `demo@sweety.com` / `Demo@1234`.

## API endpoints

All API routes use the `/api` base path. Readings and reports require a bearer token.

- `POST /api/auth/register` — create an account
- `POST /api/auth/login` — log in
- `GET /api/auth/me` — get the current user
- `GET /api/health` — health check
- `GET /api/readings` — list readings
- `POST /api/readings` — create a reading
- `PUT /api/readings/:id` — update a reading
- `DELETE /api/readings/:id` — delete a reading
- `GET /api/reports/daily?date=YYYY-MM-DD` — daily report and readings
- `GET /api/reports/month-to-date?date=YYYY-MM-DD` — current-month-to-date report
- `GET /api/reports/monthly?date=YYYY-MM-DD` — previous-month report

## Notes

### Assumptions

- “Today” is determined using the `Asia/Kolkata` timezone.
- Passwords must contain at least 8 characters.
- Reading dates are compared as calendar dates, without time-of-day comparisons.
- The maximum of four readings per day is checked before duplicate-slot validation, so the max-four message can take precedence.
- Invalid-date and invalid-slot errors use project-specific messages.

### Improvements with more time

- Add pagination for longer reading histories.
- Add charts to make trends easier to understand.
- Add Docker configuration for a repeatable local environment.
- Add frontend tests.

I used AI coding tools (GitHub Copilot) to help with this project, and I reviewed and tested all the code myself.
