-- Ce Voyage public website backend
-- Run this once in Supabase Dashboard -> SQL Editor.
-- Safe design: website visitors may INSERT only; they cannot read/update/delete submissions.

create extension if not exists pgcrypto;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  inquiry_type text not null check (inquiry_type in ('travel_request', 'tour_request', 'trip_plan', 'general')),
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'confirmed', 'closed', 'spam')),
  source text not null default 'website',
  full_name text,
  email text,
  phone text,
  contact text,
  travel_date text,
  travellers text,
  interest text,
  hotel_level text,
  message text,
  trip_items jsonb not null default '[]'::jsonb,
  page_url text,
  page_path text,
  language text,
  user_agent text,
  constraint inquiries_contact_present check (
    inquiry_type = 'trip_plan'
    or nullif(trim(coalesce(email, '')), '') is not null
    or nullif(trim(coalesce(phone, '')), '') is not null
    or nullif(trim(coalesce(contact, '')), '') is not null
  )
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status, created_at desc);
create index if not exists inquiries_type_idx on public.inquiries (inquiry_type, created_at desc);

alter table public.inquiries enable row level security;

revoke all on table public.inquiries from anon, authenticated;
grant insert on table public.inquiries to anon, authenticated;

drop policy if exists "public can submit inquiries" on public.inquiries;
create policy "public can submit inquiries"
on public.inquiries
for insert
to anon, authenticated
with check (
  source = 'website'
  and status = 'new'
  and char_length(coalesce(full_name, '')) <= 200
  and char_length(coalesce(email, '')) <= 320
  and char_length(coalesce(phone, '')) <= 80
  and char_length(coalesce(contact, '')) <= 320
  and char_length(coalesce(message, '')) <= 5000
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  source text not null default 'website',
  page_url text,
  page_path text,
  language text,
  user_agent text
);

create unique index if not exists newsletter_email_unique_idx
on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;

revoke all on table public.newsletter_subscribers from anon, authenticated;
grant insert on table public.newsletter_subscribers to anon, authenticated;

drop policy if exists "public can subscribe" on public.newsletter_subscribers;
create policy "public can subscribe"
on public.newsletter_subscribers
for insert
to anon, authenticated
with check (
  source = 'website'
  and status = 'subscribed'
  and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  and char_length(email) <= 320
);

-- Dashboard/mobile/admin clients must authenticate. Add role-based SELECT/UPDATE
-- policies later when the admin and driver apps are built. Never expose service_role
-- credentials in a website or mobile app.
