# Expense Tracker

A React + Redux expense tracker built as a hands-on, phase-by-phase learning project. It's a small app on the surface — add, edit, delete, filter, sort, search, and paginate expenses — but it deliberately implements the **same features three different ways** (Context API, hand-rolled Redux thunks, and RTK Query) so the tradeoffs between them are something you can read side by side, not just take on faith.

## Tech stack

- **React 19** + **Vite** (plain JavaScript, no TypeScript)
- **Tailwind CSS v4** (CSS-first config, no `tailwind.config.js`)
- **Redux Toolkit** + **React Redux** — the live app's state management
- **RTK Query** — drives the live app's expense data fetching/caching
- **Axios** + **axios-mock-adapter** — a fully simulated backend (pagination, filtering, sorting, search, artificial latency, and a ~15% simulated failure rate on writes) so the app behaves like it's talking to a real API without one existing
- **Context API** (`useContext` + `useReducer`) — kept as a parallel, unused-by-default implementation for comparison

## Features

- Add / edit / delete expenses, delete with a confirm step
- Category filter, sort by date or amount, live text search (title & note)
- Server-side pagination
- Running grand total and per-category totals
- Dark mode (persisted)
- Fake login/logout gate (demo credentials below)
- Data persists across reloads via the mock backend's localStorage-backed "database"

## Getting started

```bash
npm install
npm run dev
```

Log in with the demo account:

```
email: demo@example.com
password: password123
```

## Why three state-management implementations?

This project was built as a learning exercise, progressing through:

1. **React fundamentals** — components, props, lists/keys, controlled inputs, `useState`
2. **Effects & refs** — `useEffect`, `useRef`, a custom `useLocalStorage` hook
3. **Performance** — `useMemo`, `useCallback`, `React.memo`, and when they're *not* worth it
4. **Tailwind v4** — styling, dark mode, a small design-system (`Button`/`Card`/`Input`)
5. **React 19 features** — Form Actions + `useActionState`, `useOptimistic`, `useTransition`, `use()`
6. **Context API** — `ExpenseContext` + `useReducer`, and where Context's re-render model hits real limits
7. **Redux Toolkit** — hand-rolled thunks, then `createAsyncThunk` (for auth), then **RTK Query** (replacing both)

Each stage's code was mostly kept rather than deleted, specifically so the same problem (e.g. "how do I refetch the list after adding an expense?") can be compared across paradigms:

| Approach | Where | Status |
|---|---|---|
| Context + `useReducer` | `src/context/ExpenseContext.jsx`, `expenseReducer.js` | Present, **not** wired into the app |
| Redux Toolkit, hand-rolled thunks | `src/stateManagement/slice/expenseSlice.js` | Present; its data-fetching thunks are unused, but its UI state (filter/sort/search/page/edit/delete-confirm ids) is still actively shared |
| Redux Toolkit, `createAsyncThunk` | `src/stateManagement/slice/authSlice.js` | **Active** — powers login/logout |
| RTK Query | `src/stateManagement/slice/expenseApiSlice.js` | **Active** — powers all expense data fetching/mutations in the live app |

## Project structure

```
src/
├── api/fakeExpenseApi.js        # simulated latency/failure, used by the Context version
├── components/
│   ├── ui/                      # Button, Card, Input — shared primitives
│   ├── ExpenseForm.jsx          # React 19 Actions + useActionState
│   ├── ExpenseList.jsx / ExpenseItem.jsx
│   ├── ExpenseFilters.jsx
│   ├── ThemeToggle.jsx
│   ├── LoginForm.jsx / AuthGate.jsx
├── context/
│   ├── ThemeContext.jsx          # active — dark mode
│   └── ExpenseContext.jsx, expenseReducer.js   # kept for comparison, unused
├── hooks/useLocalStorage.js
├── stateManagement/
│   ├── store/configStore.jsx     # store setup, custom persistMiddleware
│   ├── slice/
│   │   ├── expenseSlice.js       # hand-rolled thunks + shared UI state
│   │   ├── authSlice.js          # createAsyncThunk
│   │   └── expenseApiSlice.js    # RTK Query
│   └── API/                      # axios instance + mock endpoints
├── App.jsx
└── main.jsx
```

## Known simplifications

- The "backend" is entirely simulated in the browser (`axios-mock-adapter`) — there's no real server, and auth tokens/sessions aren't cryptographically real.
- The Redux version deliberately does **not** replicate the Context version's optimistic-add UI — it shows a brief loading state instead, per the project's own conventions.
- A "clear all expenses" action exists in `expenseSlice.js` but isn't wired into the live (RTK Query) app, since it would need a dedicated bulk-delete endpoint to stay consistent with the rest of the data flow.
