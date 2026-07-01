# SpinGold Ultimate UI

Premium Next.js + TypeScript + Tailwind frontend project for SpinGold membership, balances, spin rewards, referrals and full admin approval/control panel.

## Run

```bash
yarn install
yarn dev
```

## Public Routes
- `/`
- `/login`
- `/signup`
- `/reset-password`
- `/membership`
- `/referrals`

## User Dashboard Routes
- `/dashboard`
- `/dashboard/membership`
- `/dashboard/cards`
- `/dashboard/spin`
- `/dashboard/rewards`
- `/dashboard/referrals`
- `/dashboard/transactions`
- `/dashboard/withdraw`
- `/dashboard/settings`
- `/dashboard/support`

## Admin Routes
- `/admin`
- `/admin/users`
- `/admin/withdrawals`
- `/admin/reward-control`
- `/admin/treasury`
- `/admin/audit`
- `/admin/settings`

## Notes
The customer and admin core flows are connected to the Express/MongoDB backend. Reward balances, memberships, withdrawals and support requests are managed through the shared API.
