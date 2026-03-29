---
Task ID: 4
Agent: full-stack-developer
Task: Rewrite Dashboard, Transactions, Auth Gate with real API

Work Summary:
Rewrote three core components to use real API calls via `src/lib/api.ts` instead of mock data:

1. **dashboard-page.tsx**: Loads balance via `api.getBalance()` and recent transactions via `api.getTransactions({ limit: 5 })`. Shows Skeleton placeholders during loading. Quick actions "Enviar" and "Receber" are disabled (no API yet). Added personalized welcome greeting.

2. **transactions-page.tsx**: Loads all transactions via `api.getTransactions()`. Client-side search filters by description. Shows 5 Skeleton rows during loading. Table caption shows filtered count.

3. **auth-gate.tsx**: Uses real `login()` and `register()` from `useAuth()` context. Empty default values (no pre-filled demo credentials). Success toasts for both login and register. Error toasts show exact backend message via `error.message`.

Bonus fixes: Fixed React 19 lint errors in `auth-context.tsx` and `checkout-page.tsx` where `setState` was called synchronously inside `useEffect` (refactored to lazy state initialization).

All files pass ESLint with zero errors.
