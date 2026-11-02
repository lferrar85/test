-- GoSolarCompare initial schema
-- Run in the Supabase SQL editor or with `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
create type technology as enum ('solar','battery','ev-charger','heat-pump');
create type application_status as enum ('received','under_review','more_info_required','approved','suspended','rejected');
create type verification_state as enum ('unverified','verified','expired','rejected');
create type accreditation_type as enum ('MCS','TRUSTMARK','RECC','HIES','NICEIC','NAPIT','ELECSA','STROMA','OTHER');
create type enquiry_status as enum ('new','matched','quotes_in_progress','quotes_received','installation_booked','installation_completed','closed');
create type planting_status as enum ('due','scheduled','confirmed');
create type user_role as enum ('admin','reviewer','installer');

-- ---------- Profiles & roles (Supabase Auth) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'installer',
  installer_id uuid,
  created_at timestamptz not null default now()
);

-- ---------- Installers ----------
create table installers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  legal_name text not null,
  trading_name text not null,
  companies_house_number text not null,
  address jsonb not null,
  website text,
  years_trading int not null default 0,
  contact jsonb not null,
  status application_status not null default 'received',
  applied_at timestamptz not null default now(),
  approved_at timestamptz,
  reverify_by timestamptz,
  technologies technology[] not null default '{}',
  coverage_areas text[] not null default '{}',
  guarantees jsonb not null default '{}',
  performance jsonb not null default '{}',
  reviews jsonb not null default '[]',
  completed_installations_verified int,
  testimonials jsonb not null default '[]',
  profile text not null default '',
  demo boolean not null default false
);
create index on installers (status);
create index on installers using gin (coverage_areas);

create table installer_accreditations (
  id uuid primary key default gen_random_uuid(),
  installer_id uuid not null references installers(id) on delete cascade,
  type accreditation_type not null,
  name text,
  reference text,
  scope technology[] not null,
  state verification_state not null default 'unverified',
  verified_at timestamptz,
  verified_by uuid references profiles(id),
  expires_at date,
  notes text
);

create table installer_insurance (
  id uuid primary key default gen_random_uuid(),
  installer_id uuid not null references installers(id) on delete cascade,
  kind text not null check (kind in ('public_liability','employers_liability','professional_indemnity')),
  insurer text,
  cover_amount_gbp numeric,
  expires_at date,
  state verification_state not null default 'unverified'
);

create table installer_documents (
  id uuid primary key default gen_random_uuid(),
  installer_id uuid not null references installers(id) on delete cascade,
  category text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  storage_path text not null,            -- private bucket "installer-documents"
  uploaded_at timestamptz not null default now()
);

create table installer_review_notes (
  id uuid primary key default gen_random_uuid(),
  installer_id uuid not null references installers(id) on delete cascade,
  at timestamptz not null default now(),
  by uuid references profiles(id),
  note text not null,
  status_after application_status
);

-- Configurable certification requirements per technology (admin editable)
create table certification_requirements (
  id uuid primary key default gen_random_uuid(),
  technology technology not null,
  label text not null,
  any_of accreditation_type[] not null,
  level text not null check (level in ('required','recommended')),
  why text
);

-- ---------- Enquiries ----------
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  created_at timestamptz not null default now(),
  postcode text not null,
  property_type text not null,
  roof jsonb not null,
  current_equipment jsonb not null,
  interests text[] not null,
  ownership text not null,
  timing text not null,
  contact jsonb not null,                -- PII: name, email, phone, notes
  consent jsonb not null,                -- shareWithInstallers, marketing, privacyVersion, recordedAt, ipHash
  status enquiry_status not null default 'new',
  assigned_to uuid references profiles(id),
  installation_completed_at timestamptz,
  completed_by_installer_id uuid references installers(id)
);
create index on enquiries (status);
create index on enquiries (created_at desc);

create table enquiry_matches (
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  installer_id uuid not null references installers(id) on delete cascade,
  matched_at timestamptz not null default now(),
  shared_with_installer_at timestamptz,
  primary key (enquiry_id, installer_id)
);

create table quotes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  installer_id uuid not null references installers(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  source text not null default 'installer_submitted',
  total_price_gbp numeric not null,
  system_size_kwp numeric,
  panel_manufacturer text,
  panel_count int,
  inverter_manufacturer text,
  battery_manufacturer text,
  battery_capacity_kwh numeric,
  estimated_annual_generation_kwh numeric,
  estimated_annual_savings_gbp jsonb,
  warranty jsonb not null default '{}',
  earliest_installation date,
  aftercare text,
  notes text
);

-- ---------- Tree planting ledger ----------
create table tree_plantings (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id),
  installer_id uuid not null references installers(id),
  installation_completed_at timestamptz not null,
  trees_due int not null default 1,
  partner text,
  status planting_status not null default 'due',
  planting_confirmed_at timestamptz,
  confirmation_reference text,
  location text
);

-- Public view: only verified totals, never per-customer data
create view public_tree_totals as
  select
    coalesce(sum(trees_due) filter (where status = 'confirmed'), 0) as trees_confirmed_planted,
    coalesce(sum(trees_due) filter (where status <> 'confirmed'), 0) as trees_due
  from tree_plantings;

-- ---------- Row level security ----------
alter table installers enable row level security;
alter table installer_accreditations enable row level security;
alter table installer_insurance enable row level security;
alter table installer_documents enable row level security;
alter table installer_review_notes enable row level security;
alter table enquiries enable row level security;
alter table enquiry_matches enable row level security;
alter table quotes enable row level security;
alter table tree_plantings enable row level security;
alter table profiles enable row level security;

create or replace function is_admin() returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','reviewer'));
$$;

-- Public may read approved installers (non-sensitive columns are selected by the API layer)
create policy "public read approved installers" on installers for select using (status = 'approved');
create policy "admins manage installers" on installers for all using (is_admin()) with check (is_admin());
create policy "admins manage accreditations" on installer_accreditations for all using (is_admin()) with check (is_admin());
create policy "admins manage insurance" on installer_insurance for all using (is_admin()) with check (is_admin());
create policy "admins manage documents" on installer_documents for all using (is_admin()) with check (is_admin());
create policy "admins manage notes" on installer_review_notes for all using (is_admin()) with check (is_admin());
create policy "installers read own record" on installers for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.installer_id = installers.id));

-- Enquiries contain PII: no public access. Inserts happen server-side with the service role.
create policy "admins manage enquiries" on enquiries for all using (is_admin()) with check (is_admin());
create policy "admins manage matches" on enquiry_matches for all using (is_admin()) with check (is_admin());
create policy "admins manage quotes" on quotes for all using (is_admin()) with check (is_admin());
create policy "admins manage trees" on tree_plantings for all using (is_admin()) with check (is_admin());
create policy "users read own profile" on profiles for select using (id = auth.uid());

-- Storage: create a PRIVATE bucket "installer-documents"; serve via signed URLs only.
-- insert into storage.buckets (id, name, public) values ('installer-documents','installer-documents', false);
