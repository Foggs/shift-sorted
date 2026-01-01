# Phase 3 Notes

## Seeded credentials (local dev)

- Manager: `manager@shift.local` / `password123`
- Worker: `worker@shift.local` / `password123`

Seed data is created by running `phase-3.sql` in your local Supabase database.

## RLS validation checklist

- Log in as manager and verify:
  - Can read only their shifts.
  - Can insert/update/delete their shifts.
  - Cannot insert shift_claims for themselves.
- Log in as worker and verify:
  - Can read only open shifts.
  - Can claim an open shift (insert into shift_claims).
  - Cannot update/delete shifts they do not own.

## CRUD helpers (client)

Use `src/lib/shifts.ts` for write actions:

- `createShift(payload)`
- `updateShift(shiftId, updates)`
- `updateShiftStatus(shiftId, status)`
- `deleteShift(shiftId)`
- `claimShift(shiftId, workerId)`
- `cancelClaim(claimId)` / `cancelClaimForShift(shiftId, workerId)`

## Phase 4 dashboard enhancements (prep for Phase 5)

- Manager "Post Shift" flow is implemented at `src/pages/PostShift.tsx` and routed via `/post-shift`.
- Dashboard now includes manager quick actions and a "View suggestions" placeholder panel per shift.
- Worker view includes a "Claim shift" button wired to `claimShift`.
- Realtime updates are consumed by `subscribeToShifts` + `subscribeToShiftClaims`, with dashboard re-fetching on changes.

## Environment dependencies

None required yet. Phase 4 uses manual lat/long input only.

Expected for Phase 5/6:

- Geocoding provider (optional) if you switch from manual coordinates to address search.
- Slack webhook/credentials for notifications.
- Any analytics or logging keys if you add event tracking.
