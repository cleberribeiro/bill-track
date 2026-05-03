# BillTrack 🌲

BillTrack is a small, no-nonsense personal finance app for tracking monthly bills, marking what is paid, and seeing what is still chewing on your wallet.

Built for people who prefer a practical tool over a circus. Open the month, add the bills, pay the bills, move on with life.

## What It Does

- Tracks bills by month
- Marks bills as `pending` or `paid`
- Shows a monthly summary with totals and pending count
- Filters bills by status
- Duplicates bills from the previous month
- Lets you edit bill name and amount inline
- Deletes bills you no longer need

## Stack

- `Node.js`
- `Fastify`
- `better-sqlite3`
- Plain `HTML`, `CSS`, and `JavaScript`
- `Jest` for tests

## Project Style

This project is intentionally simple:

- Server-rendered static frontend
- JSON API
- Local SQLite database
- Minimal moving parts

No framework parade. No twenty-layer abstraction sandwich. Just wood, steel, and bills. 🪓

## Getting Started

### Requirements

- `Node.js` 20+ recommended
- `npm`

### Install

```bash
npm install
```

### Run

```bash
npm start
```

The app will be available at:

```text
http://localhost:3000
```

## Test

```bash
npm test
```

Tests run against a temporary SQLite database, so they do not need to touch your main local data file.

## Database

By default, the app uses:

```text
data/billtrack.db
```

You can override the database path with:

```bash
BILLTRACK_DB_PATH=/your/path/billtrack.db npm start
```

## Available Scripts

- `npm start` starts the Fastify server on port `3000`
- `npm test` runs the API test suite with Jest

## Main Features

### Monthly Navigation

You can move between months and manage each month independently using the `YYYY-MM` reference format in the backend.

### Bill Management

Each bill stores:

- `name`
- `amount`
- `month_ref`
- `status`
- `sort_order`
- `created_at`

### Monthly Summary

Each month shows:

- Total amount
- Paid amount
- Pending amount
- Number of pending bills

### Duplicate From Previous Month

When a month is empty, the UI can copy bills from the previous month and reset all copied items to `pending`.

Useful for recurring expenses. Because rent has a very loyal memory.

## API Overview

### Bills

- `GET /api/months/:yearMonth/bills`
- `GET /api/months/:yearMonth/bills?status=pending`
- `GET /api/months/:yearMonth/bills?status=paid`
- `POST /api/months/:yearMonth/bills`
- `PATCH /api/bills/:id`
- `DELETE /api/bills/:id`

### Months

- `GET /api/months`
- `GET /api/months/:yearMonth/summary`
- `POST /api/months/:yearMonth/duplicate-from/:sourceYearMonth`

### Example: Create a Bill

```bash
curl -X POST http://localhost:3000/api/months/2026-05/bills \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Internet",
    "amount": 120
  }'
```

### Example Response

```json
{
  "id": 1,
  "name": "Internet",
  "amount": 120,
  "month_ref": "2026-05",
  "status": "pending",
  "sort_order": 0,
  "created_at": "2026-05-03 00:00:00"
}
```

## Project Structure

```text
.
├── data/                 # SQLite database
├── src/
│   ├── app.js            # Fastify app setup
│   ├── db.js             # SQLite connection and schema bootstrap
│   ├── server.js         # App entry point
│   ├── routes/
│   │   ├── bills.js      # Bill endpoints
│   │   └── months.js     # Month summary and duplication endpoints
│   └── public/
│       ├── index.html    # Frontend shell
│       ├── app.js        # Frontend behavior
│       └── style.css     # Frontend styles
└── tests/
    └── app.test.js       # API coverage
```

## Behavior Notes

- Bill status must be either `pending` or `paid`
- Amount cannot be negative
- Updating a missing bill returns `404`
- Duplicating from a month with no bills returns `422`

## For The Next Engineer

If you open this project six months from now with coffee in one hand and mild distrust in the other, start here:

1. Run `npm test`
2. Start the app with `npm start`
3. Open the browser and click through the monthly flow
4. Check `src/routes` first if behavior looks wrong
5. Check `src/public/app.js` if the UI feels haunted

## License

ISC
