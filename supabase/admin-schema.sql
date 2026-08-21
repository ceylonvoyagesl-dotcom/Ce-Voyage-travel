-- Ce Voyage Operations Dashboard — Phase 1+ schema and RLS
-- Run AFTER supabase/schema.sql in Supabase Dashboard -> SQL Editor.
-- Safe to re-run. Public website visitors retain INSERT-only access to inquiries.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles are the single source of truth for dashboard permissions.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null default '',
  email text not null default '',
  role text not null default 'dispatcher'
    check (role in ('super_admin', 'operations_manager', 'finance_hr', 'dispatcher')),
  avatar_url text,
  is_active boolean not null default true
);

alter table public.profiles enable row level security;

create or replace function public.has_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role = any(allowed_roles)
  );
$$;

revoke all on function public.has_role(text[]) from public;
grant execute on function public.has_role(text[]) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, ''),
    'dispatcher'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

drop policy if exists "management can read profiles" on public.profiles;
create policy "management can read profiles"
on public.profiles for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'finance_hr']));

drop policy if exists "super admins manage profiles" on public.profiles;
create policy "super admins manage profiles"
on public.profiles for all to authenticated
using (public.has_role(array['super_admin']))
with check (public.has_role(array['super_admin']));

grant select on public.profiles to authenticated;
grant insert, update, delete on public.profiles to authenticated;

-- After creating the first Auth user, bootstrap only that trusted user manually:
-- update public.profiles set role = 'super_admin' where email = 'owner@ce-voyage.com';

-- ---------------------------------------------------------------------------
-- Inquiries: extend the existing public website table for operations
-- ---------------------------------------------------------------------------

alter table public.inquiries add column if not exists updated_at timestamptz not null default now();
alter table public.inquiries add column if not exists inquiry_number text;
alter table public.inquiries add column if not exists end_date date;
alter table public.inquiries add column if not exists assigned_to uuid references public.profiles(id) on delete set null;
alter table public.inquiries add column if not exists estimated_value numeric(14,2) not null default 0;
alter table public.inquiries add column if not exists currency text not null default 'EUR';
alter table public.inquiries add column if not exists last_contacted_at timestamptz;
alter table public.inquiries add column if not exists next_follow_up_at timestamptz;
alter table public.inquiries add column if not exists internal_notes text;

-- Normalise legacy statuses after removing the original status constraint.
alter table public.inquiries drop constraint if exists inquiries_status_check;
update public.inquiries set status = 'completed' where status = 'closed';
update public.inquiries set status = 'cancelled' where status = 'spam';
alter table public.inquiries drop constraint if exists inquiries_currency_check;
alter table public.inquiries add constraint inquiries_status_check
  check (status in ('new', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled'));
alter table public.inquiries add constraint inquiries_currency_check
  check (currency in ('EUR', 'USD', 'LKR'));

create sequence if not exists public.inquiry_number_seq start 1000;
update public.inquiries
set inquiry_number = 'INQ-' || lpad(nextval('public.inquiry_number_seq')::text, 4, '0')
where inquiry_number is null;

create or replace function public.assign_inquiry_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.inquiry_number is null then
    new.inquiry_number := 'INQ-' || lpad(nextval('public.inquiry_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists inquiries_assign_number on public.inquiries;
create trigger inquiries_assign_number
before insert on public.inquiries
for each row execute procedure public.assign_inquiry_number();

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
before update on public.inquiries
for each row execute procedure public.set_updated_at();

create unique index if not exists inquiries_number_unique_idx on public.inquiries(inquiry_number) where inquiry_number is not null;
create index if not exists inquiries_assigned_idx on public.inquiries(assigned_to, status);
create index if not exists inquiries_follow_up_idx on public.inquiries(next_follow_up_at) where next_follow_up_at is not null;

grant select, update, delete on public.inquiries to authenticated;
grant usage, select on sequence public.inquiry_number_seq to anon, authenticated;

drop policy if exists "operations read inquiries" on public.inquiries;
create policy "operations read inquiries"
on public.inquiries for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'dispatcher']));

drop policy if exists "operations create inquiries" on public.inquiries;
create policy "operations create inquiries"
on public.inquiries for insert to authenticated
with check (public.has_role(array['super_admin', 'operations_manager', 'dispatcher']));

drop policy if exists "operations update inquiries" on public.inquiries;
create policy "operations update inquiries"
on public.inquiries for update to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'dispatcher']))
with check (public.has_role(array['super_admin', 'operations_manager', 'dispatcher']));

drop policy if exists "admins delete inquiries" on public.inquiries;
create policy "admins delete inquiries"
on public.inquiries for delete to authenticated
using (public.has_role(array['super_admin', 'operations_manager']));

-- ---------------------------------------------------------------------------
-- Bookings and itinerary operations
-- ---------------------------------------------------------------------------

create sequence if not exists public.booking_number_seq start 3000;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  booking_number text not null unique default ('CV-' || lpad(nextval('public.booking_number_seq')::text, 4, '0')),
  inquiry_id uuid references public.inquiries(id) on delete set null,
  guest_name text not null,
  guest_email text,
  guest_phone text,
  tour_name text not null,
  itinerary jsonb not null default '[]'::jsonb,
  start_date date not null,
  end_date date not null,
  travellers integer not null default 1 check (travellers > 0),
  status text not null default 'draft'
    check (status in ('draft', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  total_amount numeric(14,2) not null default 0 check (total_amount >= 0),
  paid_amount numeric(14,2) not null default 0 check (paid_amount >= 0),
  currency text not null default 'EUR' check (currency in ('EUR', 'USD', 'LKR')),
  assigned_agent uuid references public.profiles(id) on delete set null,
  pickup_details text,
  guest_notes text,
  internal_notes text,
  constraint booking_dates_valid check (end_date >= start_date)
);

create index if not exists bookings_dates_idx on public.bookings(start_date, end_date);
create index if not exists bookings_status_idx on public.bookings(status, start_date);
create unique index if not exists bookings_inquiry_unique_idx on public.bookings(inquiry_id) where inquiry_id is not null;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at before update on public.bookings
for each row execute procedure public.set_updated_at();

alter table public.bookings enable row level security;
grant select, insert, update, delete on public.bookings to authenticated;
grant usage, select on sequence public.booking_number_seq to authenticated;

drop policy if exists "staff read bookings" on public.bookings;
create policy "staff read bookings" on public.bookings for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'finance_hr', 'dispatcher']));

drop policy if exists "operations manage bookings" on public.bookings;
create policy "operations manage bookings" on public.bookings for all to authenticated
using (public.has_role(array['super_admin', 'operations_manager']))
with check (public.has_role(array['super_admin', 'operations_manager']));

drop policy if exists "dispatchers update bookings" on public.bookings;
create policy "dispatchers update bookings" on public.bookings for update to authenticated
using (public.has_role(array['dispatcher']))
with check (public.has_role(array['dispatcher']));

-- ---------------------------------------------------------------------------
-- Staff, drivers, vehicles and dispatch
-- ---------------------------------------------------------------------------

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  employee_number text unique,
  full_name text not null,
  staff_type text not null check (staff_type in ('chauffeur_guide', 'driver', 'office_staff', 'contractor')),
  email text,
  phone text,
  address text,
  join_date date,
  employment_status text not null default 'active' check (employment_status in ('active', 'leave', 'inactive')),
  base_salary numeric(14,2) not null default 0,
  default_batta numeric(14,2) not null default 0,
  commission_rate numeric(6,3) not null default 0,
  emergency_contact jsonb not null default '{}'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  notes text
);

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  staff_id uuid unique references public.staff(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  driver_type text not null default 'driver' check (driver_type in ('driver', 'chauffeur_guide')),
  languages text[] not null default array['en']::text[],
  license_number text not null,
  license_expiry date,
  nic_or_passport text,
  home_base text,
  availability_status text not null default 'available'
    check (availability_status in ('available', 'assigned', 'leave', 'inactive')),
  rating numeric(3,2) check (rating is null or (rating >= 0 and rating <= 5)),
  notes text
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  registration_number text not null unique,
  make text not null,
  model text not null,
  model_year integer,
  vehicle_type text not null check (vehicle_type in ('car', 'van', 'minibus', 'bus', 'safari_jeep', 'tuk_tuk', 'other')),
  chassis_number text,
  engine_number text,
  seat_count integer not null default 4 check (seat_count > 0),
  owner_type text not null default 'company' check (owner_type in ('company', 'partner', 'rental')),
  owner_name text,
  insurance_expiry date,
  revenue_license_expiry date,
  status text not null default 'available' check (status in ('available', 'assigned', 'service', 'inactive')),
  odometer_km numeric(12,1),
  notes text
);

create table if not exists public.trip_assignments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  assigned_by uuid references public.profiles(id) on delete set null default auth.uid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  trip_status text not null default 'assigned'
    check (trip_status in ('assigned', 'ready', 'pickup', 'on_tour', 'delayed', 'completed', 'cancelled')),
  pickup_location text,
  current_location text,
  dispatcher_notes text,
  driver_notes text,
  unique (booking_id),
  constraint assignment_dates_valid check (ends_at >= starts_at)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  work_date date not null,
  attendance_type text not null check (attendance_type in ('office', 'tour_day', 'leave', 'absent', 'off_day')),
  booking_id uuid references public.bookings(id) on delete set null,
  check_in timestamptz,
  check_out timestamptz,
  notes text,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique(staff_id, work_date)
);

create table if not exists public.staff_payouts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  staff_id uuid not null references public.staff(id) on delete restrict,
  booking_id uuid references public.bookings(id) on delete set null,
  payout_type text not null check (payout_type in ('salary', 'driver_fee', 'batta', 'commission', 'reimbursement', 'other')),
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'LKR' check (currency in ('EUR', 'USD', 'LKR')),
  period_start date,
  period_end date,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'cancelled')),
  paid_at timestamptz,
  notes text,
  approved_by uuid references public.profiles(id) on delete set null
);

create index if not exists drivers_availability_idx on public.drivers(availability_status);
create index if not exists vehicles_status_idx on public.vehicles(status);
create index if not exists assignments_status_idx on public.trip_assignments(trip_status, starts_at);
create index if not exists attendance_staff_date_idx on public.attendance(staff_id, work_date desc);
create index if not exists staff_payouts_staff_idx on public.staff_payouts(staff_id, status);

do $$
declare table_name text;
begin
  foreach table_name in array array['staff','drivers','vehicles','trip_assignments'] loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_set_updated_at', table_name);
    execute format('create trigger %I before update on public.%I for each row execute procedure public.set_updated_at()', table_name || '_set_updated_at', table_name);
  end loop;
end $$;

alter table public.staff enable row level security;
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.trip_assignments enable row level security;
alter table public.attendance enable row level security;
alter table public.staff_payouts enable row level security;

grant select, insert, update, delete on public.staff, public.drivers, public.vehicles, public.trip_assignments, public.attendance, public.staff_payouts to authenticated;

-- Reusable policy pattern is intentionally explicit so each table remains auditable.
drop policy if exists "management read staff" on public.staff;
create policy "management read staff" on public.staff for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'finance_hr']));
drop policy if exists "hr manage staff" on public.staff;
create policy "hr manage staff" on public.staff for all to authenticated
using (public.has_role(array['super_admin', 'finance_hr'])) with check (public.has_role(array['super_admin', 'finance_hr']));

drop policy if exists "operations read drivers" on public.drivers;
create policy "operations read drivers" on public.drivers for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'dispatcher', 'finance_hr']));
drop policy if exists "operations manage drivers" on public.drivers;
create policy "operations manage drivers" on public.drivers for all to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'dispatcher'])) with check (public.has_role(array['super_admin', 'operations_manager', 'dispatcher']));

drop policy if exists "staff read vehicles" on public.vehicles;
create policy "staff read vehicles" on public.vehicles for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'dispatcher', 'finance_hr']));
drop policy if exists "operations manage vehicles" on public.vehicles;
create policy "operations manage vehicles" on public.vehicles for all to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'dispatcher'])) with check (public.has_role(array['super_admin', 'operations_manager', 'dispatcher']));

drop policy if exists "staff read assignments" on public.trip_assignments;
create policy "staff read assignments" on public.trip_assignments for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'dispatcher', 'finance_hr']));
drop policy if exists "dispatch manage assignments" on public.trip_assignments;
create policy "dispatch manage assignments" on public.trip_assignments for all to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'dispatcher'])) with check (public.has_role(array['super_admin', 'operations_manager', 'dispatcher']));

drop policy if exists "hr read attendance" on public.attendance;
create policy "hr read attendance" on public.attendance for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'finance_hr']));
drop policy if exists "hr manage attendance" on public.attendance;
create policy "hr manage attendance" on public.attendance for all to authenticated
using (public.has_role(array['super_admin', 'finance_hr'])) with check (public.has_role(array['super_admin', 'finance_hr']));

drop policy if exists "hr read payouts" on public.staff_payouts;
create policy "hr read payouts" on public.staff_payouts for select to authenticated
using (public.has_role(array['super_admin', 'finance_hr']));
drop policy if exists "hr manage payouts" on public.staff_payouts;
create policy "hr manage payouts" on public.staff_payouts for all to authenticated
using (public.has_role(array['super_admin', 'finance_hr'])) with check (public.has_role(array['super_admin', 'finance_hr']));

-- ---------------------------------------------------------------------------
-- Quotations, invoices, payments and tour expenses
-- ---------------------------------------------------------------------------

create sequence if not exists public.invoice_number_seq start 2000;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  invoice_number text not null unique default ('INV-' || lpad(nextval('public.invoice_number_seq')::text, 5, '0')),
  document_type text not null default 'invoice' check (document_type in ('quotation', 'invoice', 'credit_note')),
  booking_id uuid references public.bookings(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  customer_name text not null,
  customer_email text,
  billing_address text,
  issue_date date not null default current_date,
  due_date date,
  currency text not null default 'EUR' check (currency in ('EUR', 'USD', 'LKR')),
  subtotal numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'part_paid', 'paid', 'overdue', 'void')),
  notes text,
  terms text,
  created_by uuid references public.profiles(id) on delete set null default auth.uid()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  position integer not null default 0,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(14,2) not null default 0,
  line_total numeric(14,2) generated always as (quantity * unit_price) stored
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  invoice_id uuid references public.invoices(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null check (currency in ('EUR', 'USD', 'LKR')),
  payment_date date not null default current_date,
  payment_method text check (payment_method in ('cash', 'bank_transfer', 'card', 'online', 'other')),
  reference text,
  notes text,
  recorded_by uuid references public.profiles(id) on delete set null default auth.uid()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expense_date date not null default current_date,
  booking_id uuid references public.bookings(id) on delete set null,
  category text not null check (category in ('hotel', 'park_ticket', 'activity', 'fuel', 'driver', 'vehicle', 'meal', 'office', 'marketing', 'other')),
  vendor_name text,
  description text not null,
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'LKR' check (currency in ('EUR', 'USD', 'LKR')),
  base_amount_lkr numeric(14,2),
  payment_status text not null default 'paid' check (payment_status in ('pending', 'approved', 'paid', 'cancelled')),
  receipt_url text,
  notes text,
  recorded_by uuid references public.profiles(id) on delete set null default auth.uid(),
  approved_by uuid references public.profiles(id) on delete set null
);

-- Compatibility for projects that already had basic invoices/payments/expenses
-- tables before the Operations Dashboard migration. These statements preserve
-- existing rows and add only the fields required by dashboard indexes/reports.
alter table public.invoices add column if not exists booking_id uuid references public.bookings(id) on delete set null;
alter table public.invoices add column if not exists status text not null default 'draft';

alter table public.payments add column if not exists booking_id uuid references public.bookings(id) on delete set null;
alter table public.payments add column if not exists payment_date date not null default current_date;
alter table public.payments add column if not exists amount numeric(14,2) not null default 0;
alter table public.payments add column if not exists currency text not null default 'LKR';

alter table public.expenses add column if not exists booking_id uuid references public.bookings(id) on delete set null;
alter table public.expenses add column if not exists category text not null default 'other';
alter table public.expenses add column if not exists amount numeric(14,2) not null default 0;
alter table public.expenses add column if not exists currency text not null default 'LKR';
alter table public.expenses add column if not exists payment_status text not null default 'paid';

create index if not exists invoices_booking_idx on public.invoices(booking_id, status);
create index if not exists payments_booking_idx on public.payments(booking_id, payment_date desc);
create index if not exists expenses_booking_idx on public.expenses(booking_id, category);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices
for each row execute procedure public.set_updated_at();

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
grant select, insert, update, delete on public.invoices, public.invoice_items, public.payments, public.expenses to authenticated;
grant usage, select on sequence public.invoice_number_seq to authenticated;

drop policy if exists "business staff read invoices" on public.invoices;
create policy "business staff read invoices" on public.invoices for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'finance_hr']));
drop policy if exists "business staff manage invoices" on public.invoices;
create policy "business staff manage invoices" on public.invoices for all to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'finance_hr'])) with check (public.has_role(array['super_admin', 'operations_manager', 'finance_hr']));

drop policy if exists "business staff read invoice items" on public.invoice_items;
create policy "business staff read invoice items" on public.invoice_items for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'finance_hr']));
drop policy if exists "business staff manage invoice items" on public.invoice_items;
create policy "business staff manage invoice items" on public.invoice_items for all to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'finance_hr'])) with check (public.has_role(array['super_admin', 'operations_manager', 'finance_hr']));

drop policy if exists "finance read payments" on public.payments;
create policy "finance read payments" on public.payments for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'finance_hr']));
drop policy if exists "finance manage payments" on public.payments;
create policy "finance manage payments" on public.payments for all to authenticated
using (public.has_role(array['super_admin', 'finance_hr'])) with check (public.has_role(array['super_admin', 'finance_hr']));

drop policy if exists "operations read expenses" on public.expenses;
create policy "operations read expenses" on public.expenses for select to authenticated
using (public.has_role(array['super_admin', 'operations_manager', 'finance_hr']));
drop policy if exists "finance manage expenses" on public.expenses;
create policy "finance manage expenses" on public.expenses for all to authenticated
using (public.has_role(array['super_admin', 'finance_hr'])) with check (public.has_role(array['super_admin', 'finance_hr']));
drop policy if exists "operations submit expenses" on public.expenses;
create policy "operations submit expenses" on public.expenses for insert to authenticated
with check (public.has_role(array['operations_manager']));

-- Profitability view: totals remain in their recorded currency. Convert into a base
-- currency in reporting using a managed exchange-rate snapshot before summing.
create or replace view public.booking_profitability
with (security_invoker = true)
as
select
  b.id as booking_id,
  b.booking_number,
  b.currency,
  b.total_amount as booked_revenue,
  b.paid_amount as received_revenue,
  coalesce(sum(case when e.currency = b.currency and e.payment_status <> 'cancelled' then e.amount else 0 end), 0) as expenses_in_booking_currency,
  b.total_amount - coalesce(sum(case when e.currency = b.currency and e.payment_status <> 'cancelled' then e.amount else 0 end), 0) as estimated_net_profit
from public.bookings b
left join public.expenses e on e.booking_id = b.id
group by b.id, b.booking_number, b.currency, b.total_amount, b.paid_amount;

grant select on public.booking_profitability to authenticated;

create or replace view public.monthly_revenue_report
with (security_invoker = true)
as
select
  date_trunc('month', payment_date)::date as revenue_month,
  currency,
  count(*) as payment_count,
  sum(amount) as revenue_received
from public.payments
group by date_trunc('month', payment_date)::date, currency
order by revenue_month desc, currency;

grant select on public.monthly_revenue_report to authenticated;

-- ---------------------------------------------------------------------------
-- Public website content management
-- ---------------------------------------------------------------------------

create table if not exists public.live_feed_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  cover_image_url text,
  language text not null default 'en',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  author_id uuid references public.profiles(id) on delete set null
);

create table if not exists public.seasonal_tour_prices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  tour_code text not null,
  tour_name text not null,
  season_name text not null,
  valid_from date not null,
  valid_to date not null,
  currency text not null default 'EUR' check (currency in ('EUR', 'USD', 'LKR')),
  price_per_person numeric(14,2) not null,
  single_supplement numeric(14,2) not null default 0,
  is_active boolean not null default true,
  notes text,
  constraint seasonal_price_dates_valid check (valid_to >= valid_from)
);

create table if not exists public.hotel_partners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  destination text not null,
  star_rating numeric(2,1),
  contact_name text,
  email text,
  phone text,
  website_url text,
  contract_from date,
  contract_to date,
  rate_details jsonb not null default '{}'::jsonb,
  amenities text[] not null default '{}'::text[],
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  notes text
);

alter table public.live_feed_posts enable row level security;
alter table public.seasonal_tour_prices enable row level security;
alter table public.hotel_partners enable row level security;
grant select on public.live_feed_posts, public.seasonal_tour_prices to anon, authenticated;
grant select on public.hotel_partners to authenticated;
grant insert, update, delete on public.live_feed_posts, public.seasonal_tour_prices, public.hotel_partners to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['live_feed_posts','seasonal_tour_prices','hotel_partners'] loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_set_updated_at', table_name);
    execute format('create trigger %I before update on public.%I for each row execute procedure public.set_updated_at()', table_name || '_set_updated_at', table_name);
  end loop;
end $$;

drop policy if exists "public read published feed" on public.live_feed_posts;
create policy "public read published feed" on public.live_feed_posts for select to anon, authenticated
using (status = 'published' and published_at <= now());
drop policy if exists "content team manage feed" on public.live_feed_posts;
create policy "content team manage feed" on public.live_feed_posts for all to authenticated
using (public.has_role(array['super_admin', 'operations_manager'])) with check (public.has_role(array['super_admin', 'operations_manager']));

drop policy if exists "public read active prices" on public.seasonal_tour_prices;
create policy "public read active prices" on public.seasonal_tour_prices for select to anon, authenticated
using (is_active = true and current_date between valid_from and valid_to);
drop policy if exists "content team manage prices" on public.seasonal_tour_prices;
create policy "content team manage prices" on public.seasonal_tour_prices for all to authenticated
using (public.has_role(array['super_admin', 'operations_manager'])) with check (public.has_role(array['super_admin', 'operations_manager']));

drop policy if exists "public read hotel directory" on public.hotel_partners;
create policy "public read hotel directory" on public.hotel_partners for select to anon, authenticated
using (status = 'active');
drop policy if exists "content team manage hotels" on public.hotel_partners;
create policy "content team manage hotels" on public.hotel_partners for all to authenticated
using (public.has_role(array['super_admin', 'operations_manager'])) with check (public.has_role(array['super_admin', 'operations_manager']));

-- The public directory deliberately omits contacts, contract dates, rates and notes.
create or replace view public.hotel_directory
with (security_barrier = true)
as
select id, name, destination, star_rating, website_url, amenities
from public.hotel_partners
where status = 'active';
revoke all on public.hotel_directory from public;
grant select on public.hotel_directory to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Audit trail
-- ---------------------------------------------------------------------------

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  actor_id uuid references public.profiles(id) on delete set null default auth.uid(),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.audit_logs enable row level security;
grant select, insert on public.audit_logs to authenticated;

drop policy if exists "authenticated staff create audit logs" on public.audit_logs;
create policy "authenticated staff create audit logs" on public.audit_logs for insert to authenticated
with check (actor_id = auth.uid());
drop policy if exists "admins read audit logs" on public.audit_logs;
create policy "admins read audit logs" on public.audit_logs for select to authenticated
using (public.has_role(array['super_admin']));

-- End of Ce Voyage operations schema.
