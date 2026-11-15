# PennyWise

A local-first personal finance tracker. No account, no bank access, no external APIs — your data lives in your browser's IndexedDB.

**Suggested GitHub topics:** `personal-finance` `react` `typescript` `vite` `tailwindcss` `indexeddb` `zustand` `recharts` `local-first`

## Features
- Dashboard: balance, monthly income/expenses/savings, savings rate, daily spending chart, category breakdown, budget utilization, month selector
- Transactions: add/edit/delete, categories (+ custom), payment methods, notes, search, filter, sort
- Budgets: overall and per-category limits with progress bars and overspend warnings
- Savings goals: targets, deadlines, add money, progress
- Settings: dark/light theme, custom categories, JSON backup/restore, CSV export/import, reset with confirmation
- Indian number formatting (₹1,25,000), responsive layout (sidebar on desktop, bottom nav on mobile)

## Tech stack
React 18 + TypeScript, Vite, Tailwind CSS, Zustand (persisted to IndexedDB via idb-keyval), React Router, Zod, date-fns, Recharts, Lucide.

## Getting started
```bash
npm install
npm run dev      # development
npm run build    # production build
```

## Architecture
`src/lib/store.ts` is the single persistence boundary (state + IndexedDB storage adapter), so a cloud sync layer can later replace or wrap the storage adapter without touching the UI.

## Screenshots
_Add screenshots to `docs/` and link them here._

## Roadmap
Recurring transactions, analytics page, PWA install support, locally computed insights.

## License
MIT
