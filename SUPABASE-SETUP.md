# Supabase setup — Ce Voyage

The website is ready to store these customer actions:

- Homepage travel requests → `inquiries`
- 10-day tour requests → `inquiries`
- My Trip WhatsApp requests → `inquiries`
- Newsletter sign-ups → `newsletter_subscribers`

WhatsApp still opens as before. Database storage is an additional step, so a temporary database failure does not lose the customer's WhatsApp flow.

## 1. Create the tables and security rules

1. Open the Supabase project.
2. Go to **SQL Editor** → **New query**.
3. Copy all of [`supabase/schema.sql`](supabase/schema.sql) and run it once.

The included Row Level Security rules let public visitors insert a request, but do **not** let them read, edit, or delete customer data.

## 2. Add public browser credentials

Open `config.js` and replace:

```js
supabase: {
  url: "YOUR_SUPABASE_PROJECT_URL",
  anonKey: "YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY"
}
```

Find both values under **Supabase Dashboard → Project Settings → API**.

Use only the public **anon** or **publishable** key. Never add a `service_role`, secret key, database password, or JWT signing secret to this repository.

## 3. Test

After deployment, submit one of each form and check:

- **Table Editor → inquiries**
- **Table Editor → newsletter_subscribers**
- Browser Developer Tools → Console/Network for an error from `/rest/v1/...`

The homepage newsletter intentionally shows “temporarily unavailable” until valid credentials are configured. Other enquiry buttons preserve the current WhatsApp behaviour even when Supabase is not yet configured.

## Future admin and mobile apps

Do not weaken the public policies to allow anonymous reads. The traveller, driver, guide, and admin apps should use Supabase Auth. Add authenticated role-based read/update policies when those apps and their user roles are designed. Keep `service_role` usage on a trusted server or Edge Function only.
