# Time Series Analysis App

This repository contains a Vite and React dashboard for exploring time-series data in the browser. The current app generates sample datasets locally, accepts CSV or JSON uploads, and displays overview, forecasting, anomaly, and decomposition views.

Try the deployed app: [Time Series Analysis](https://time-series-delta.vercel.app/).

## Current behavior

- Sample stock-price, sales, and temperature series are generated when the app starts; these are synthetic examples, not real observations.
- CSV imports should include a date or timestamp column and a numeric value column. JSON imports use `{ "id", "name", "data": [{ "timestamp", "value" }] }`.
- Forecasting runs in the browser. The ARIMA option is explicitly a simulation; it is not an ARIMA model implementation.
- The `backend/` files are currently empty, so this repository does not provide a runnable Python API or server-side forecasting service.

## Run the frontend

Use Node.js 20 and npm, then run these commands from the repository root:

```bash
npm ci
npm run dev
```

The development server prints the local URL. To create a production build or run the configured linter:

```bash
npm run build
npm run lint
```

The package lockfile is checked in. Vitest runs the frontend unit tests with `npm run test`. GitHub Actions runs lint, tests, and a production build on pull requests and pushes to `main`. The repository is not configured for Azure Functions deployment; its backend is empty scaffolding.

## Project layout

- `src/` — React dashboard, data import, charts, and browser-side analysis utilities.
- `backend/` — empty scaffolding; no backend dependencies or runnable service are present yet.
- `frontend/` — secondary frontend files; the root `package.json` is the configured app entry point.
