create table public.stadiums (
  id serial not null,
  name character varying(200) not null,
  city character varying(100) not null,
  country character varying(100) not null,
  capacity integer not null,
  inauguration_year integer null,
  surface_type character varying(50) null default 'Grass'::character varying,
  roof_type character varying(50) null default 'Open'::character varying,
  address text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint stadiums_pkey primary key (id),
  constraint stadiums_name_key unique (name)
) TABLESPACE pg_default;

create index IF not exists idx_stadiums_country on public.stadiums using btree (country) TABLESPACE pg_default;

create index IF not exists idx_stadiums_city on public.stadiums using btree (city) TABLESPACE pg_default;

create index IF not exists idx_stadiums_capacity on public.stadiums using btree (capacity) TABLESPACE pg_default;

create trigger update_stadiums_updated_at BEFORE
update on stadiums for EACH row
execute FUNCTION update_updated_at_column ();

create table public.matches (
  id serial not null,
  home_team character varying(100) not null,
  away_team character varying(100) not null,
  date date not null,
  time time without time zone null,
  stadium_id integer not null,
  ticket_price_min numeric(10, 2) null,
  ticket_price_max numeric(10, 2) null,
  total_capacity integer null default 0,
  competition character varying(100) null,
  season character varying(20) null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint matches_pkey primary key (id),
  constraint fk_stadium foreign KEY (stadium_id) references stadiums (id) on delete RESTRICT
) TABLESPACE pg_default;

create index IF not exists idx_matches_date on public.matches using btree (date) TABLESPACE pg_default;

create index IF not exists idx_matches_home_team on public.matches using btree (home_team) TABLESPACE pg_default;

create index IF not exists idx_matches_away_team on public.matches using btree (away_team) TABLESPACE pg_default;

create index IF not exists idx_matches_stadium_id on public.matches using btree (stadium_id) TABLESPACE pg_default;

create index IF not exists idx_matches_competition on public.matches using btree (competition) TABLESPACE pg_default;

create trigger update_matches_updated_at BEFORE
update on matches for EACH row
execute FUNCTION update_updated_at_column ();

create table public.users (
  id serial not null,
  email character varying(255) not null,
  nom character varying(100) not null,
  prenom character varying(100) not null,
  password character varying(255) null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email)
) TABLESPACE pg_default;

create index IF not exists idx_users_email on public.users using btree (email) TABLESPACE pg_default;

-- Insert sample user data
INSERT INTO public.users (id, email, nom, prenom, password) 
VALUES (1, 'maindf@gmail.com', 'Dupont', 'Jean', '123456')
ON CONFLICT DO NOTHING;

