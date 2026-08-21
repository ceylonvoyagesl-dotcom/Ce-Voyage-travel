# Ce Voyage Operations Dashboard

Next.js App Router operations workspace for Ce Voyage. Phase 1 includes secure authentication, role-aware navigation, the Inquiries pipeline, booking management, CSV export and print-ready quotation generation.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Supabase Auth, Postgres and Row Level Security
- Lucide React icons

## Run locally

```bash
cd admin
npm install
cp .env.example .env.local
# Add your Supabase project URL and publishable key
npm run dev
```

Open `http://localhost:3000`. If Supabase variables are absent, the login screen exposes a local, non-persistent demo workspace with role previews.

## Supabase setup

1. Run `../supabase/schema.sql` for the website inquiry tables.
2. Run `../supabase/admin-schema.sql` for dashboard tables, functions and RLS policies.
3. In Supabase Auth, create the first internal user.
4. Bootstrap that trusted user from the SQL Editor:

```sql
update public.profiles
set role = 'super_admin'
where email = 'owner@ce-voyage.com';
```

5. Create additional Auth users and assign one of:
   - `super_admin`
   - `operations_manager`
   - `finance_hr`
   - `dispatcher`

Never place a `service_role` or secret key in `.env.local`; the browser uses only the Supabase publishable key and all data access is enforced by RLS.

## Phase 1 routes

| Route | Purpose |
|---|---|
| `/login` | Supabase email/password login and local role demo |
| `/dashboard` | Operations KPIs, upcoming tours, activity and revenue snapshot |
| `/inquiries` | Searchable inquiry table, pipeline view, status workflow and conversion |
| `/bookings` | Confirmed journey, payment and dispatch overview |
| `/fleet`, `/staff`, `/finance`, `/content` | Role-aware module foundations for later phases |

## Phase roadmap

- **Phase 2:** full fleet registry, driver compliance and assignment board
- **Phase 3:** HR, attendance, Batta, payouts, invoices, expenses and reporting
- **Phase 4:** live feed, seasonal rates and hotel partner content
