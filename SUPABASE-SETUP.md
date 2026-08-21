# Supabase setup — Ce Voyage

The website stores customer submissions directly in Supabase:

- Homepage travel requests → `inquiries` (inquiry_type: `travel_request`)
- 10-day tour requests → `inquiries` (inquiry_type: `tour_request`)
- My Trip requests → `inquiries` (inquiry_type: `trip_plan`)
- Newsletter sign-ups → `newsletter_subscribers`

Submissions are sent directly to the Supabase REST API via `apikey` header and display instant on-page confirmation messages without redirecting to WhatsApp.

## 1. Create the tables and security rules

1. Open the Supabase project.
2. Go to **SQL Editor** → **New query**.
3. Copy all of [`supabase/schema.sql`](supabase/schema.sql) and run it once.

The included Row Level Security rules let public visitors insert submissions securely, but do **not** allow anonymous reading, updating, or deleting of customer data.

## 2. Public browser credentials

In `config.js`:

```js
supabase: {
  url: "https://xlejfklsatjqhsbwmalf.supabase.co",
  anonKey: "sb_publishable_..."
}
```

Use only the public **anon** or **publishable** key. The client automatically sends publishable keys via the `apikey` header (without `Authorization: Bearer`). Never place a `service_role` or secret key in browser code.

## 3. Test

After deployment, submit test entries on each form and verify:

- **Table Editor → inquiries**
- **Table Editor → newsletter_subscribers**
- Inspect network requests to ensure `201 Created` responses from `/rest/v1/...`

## 4. Operations dashboard

The authenticated Next.js dashboard is in [`admin/`](admin/README.md). After the public schema above, run [`supabase/admin-schema.sql`](supabase/admin-schema.sql) to install its business tables, role profiles, helper functions, audit trail and Row Level Security policies.

Create internal team members through **Authentication → Users**. The profile trigger safely assigns new accounts the least-privileged `dispatcher` role. Bootstrap the first trusted owner in SQL, then manage roles from an authenticated admin workflow:

```sql
update public.profiles
set role = 'super_admin'
where email = 'owner@ce-voyage.com';
```

Configure `admin/.env.local` from `admin/.env.example` with only the project URL and public publishable key. Never weaken public inquiry policies or expose a `service_role` key in the website or dashboard.
