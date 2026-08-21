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

## Future admin and mobile apps

Do not weaken the public policies to allow anonymous reads. The traveller, driver, guide, and admin apps should use Supabase Auth. Add authenticated role-based read/update policies when those apps and their user roles are designed. Keep `service_role` usage on a trusted server or Edge Function only.
