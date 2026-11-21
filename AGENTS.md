# Repository Guidelines

## Stack

Node.js CommonJS application using Express and `body-parser`. `server.js` serves the static browser UI and mounts API routes. Persistent application data is JSON in `data/db.json`.

## Module map

### Routes
- `routes/products.js` — product catalog and active-coupon endpoints.
- `routes/orders.js` — order listing, creation, retrieval, and cancellation.
- `routes/customers.js` — customer listing and Khata settlements.
- `routes/reports.js` — dashboard, GST reconciliation, price preview, and export.

### Libraries
- `lib/store.js` — JSON read/write and audit-log helpers.
- `lib/orders.js` — order creation, lookup, cancellation, and filtering.
- `lib/inventory.js` — product lookup, stock checks, reservation, release, and summary.
- `lib/pricing.js` — subtotals, discounts, and order totals.
- `lib/tax.js` — GST rate lookup and CGST/SGST split.
- `lib/coupons.js` — coupon normalization, validation, and discount calculation.
- `lib/ledger.js` — Khata balances, charges, reversals, and settlements.
- `lib/invoice.js` — invoice figures and printable HTML rendering.
- `lib/reports.js` — dashboard and invoice/ledger reconciliation.
- `lib/dates.js` — date formatting, normalization, and fiscal years.

## Commands

- Start the app: `npm start` (`node server.js`).
- Run Node tests: `node --test`. No test files or test framework configuration currently exist.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Invoice total and GST breakdown do not match what the customer was billed. Allowed files: `lib/invoice.js`; use `lib/tax.js` only if truly needed.
