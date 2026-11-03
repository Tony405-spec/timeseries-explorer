# Time Series Explorer

An interactive, browser-based dashboard for exploring time-series data. Upload your own CSV or JSON files, or start with built-in sample datasets, then inspect trends, forecasts, anomalies, and seasonal patterns without any backend setup.

**[Live demo →](https://time-series-delta.vercel.app/)**

## Purpose

This repository is a learning project. I built it to help me understand time series concepts by implementing and visualizing them hands-on, rather than only reading about them. Each view in the dashboard corresponds to a core idea in time series analysis, so I can experiment with real and synthetic data and see how the concepts behave.

## Concepts covered

- **Trend and seasonality:** how a series moves over the long term and repeats over fixed periods
- **Decomposition:** splitting a series into trend, seasonal, and residual components
- **Forecasting:** predicting future values from past behavior (the ARIMA option is a simulation, not a full ARIMA implementation)
- **Anomaly detection:** spotting points that deviate from the expected pattern
- **Data preparation:** handling timestamps, ordering, and numeric values in uploaded data

## Features

- **Overview:** summary statistics and interactive charts for any series
- **Forecasting:** in-browser forecasting with multiple methods
- **Anomaly detection:** highlight unusual points in your data
- **Decomposition:** separate trend, seasonality, and residuals
- **Bring your own data:** CSV and JSON uploads, all processed locally in your browser
- **Sample datasets:** synthetic stock-price, sales, and temperature series generated on startup (not real observations)

## Data formats

**CSV:** include a date/timestamp column and a numeric value column.

**JSON:**

​```json
{
  "id": "sales",
  "name": "Monthly Sales",
  "data": [{ "timestamp": "2025-01-01", "value": 120 }]
}
​```

## Getting started

Requires Node.js 20+ and npm.

​```bash
npm ci
npm run dev
​```

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run the linter |
| `npm run test` | Run Vitest unit tests |

CI runs lint, tests, and a production build on every pull request and push to `main`.

## Project structure

- `src/`: React dashboard, data import, charts, and analysis utilities
- `frontend/`: secondary frontend files (the root `package.json` is the app entry point)
- `backend/`: empty scaffolding for a future server-side forecasting service

## Roadmap

- Implement a real ARIMA model (server-side or WASM)
- Build out the `backend/` forecasting API
- Add export for charts and forecasts
- Add short notes explaining each concept next to its chart

## Limitations

- Sample data is synthetic.
- Forecasting runs entirely in the browser; there is no server-side processing yet.
- This is a learning project, so the methods are simplified and not intended for production forecasting.
