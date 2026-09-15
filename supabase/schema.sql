-- Schema snapshot of the Supabase public schema — taken 2026-09-15 (PostgreSQL 17.6).
-- Produced read-only with pg_dump 17 --schema-only --schema=public --no-subscriptions;
-- scanned for secrets/PII; psql restrict/unrestrict lines stripped. See supabase/README.md.
-- Read-only snapshot for review/diffing — NOT a migration. The dashboard is the source of truth.
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6 (Debian 17.6-1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
  BEGIN
    INSERT INTO public.user_profiles (id, full_name, phone, date_of_birth, notifications_enabled)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'phone',
      (NEW.raw_user_meta_data ->> 'date_of_birth')::date,
      true
    );
    RETURN NEW;
  END;
  $$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION public.handle_updated_at() OWNER TO postgres;

--
-- Name: update_announcements_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_announcements_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = TIMEZONE('UTC'::text, NOW());
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_announcements_updated_at() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    image_url character varying(500),
    image_alt_text character varying(255),
    button_text character varying(100),
    button_url character varying(500),
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    display_type character varying(20) NOT NULL,
    priority integer DEFAULT 5 NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('UTC'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('UTC'::text, now()) NOT NULL
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(255) NOT NULL,
    "position" character varying(255) NOT NULL,
    phone character varying(20),
    email character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('UTC'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('UTC'::text, now())
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- Name: donations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stripe_event_id text,
    fund_code text NOT NULL,
    amount_cents integer NOT NULL,
    currency text NOT NULL,
    donor_email text,
    mode text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT donations_fund_code_check CHECK ((fund_code = ANY (ARRAY['general'::text, 'zekat'::text, 'sadaka'::text, 'cenaze'::text, 'fitre'::text])))
);


ALTER TABLE public.donations OWNER TO postgres;

--
-- Name: daily_donation_totals; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.daily_donation_totals WITH (security_invoker='true') AS
 SELECT date(created_at) AS date_only,
    (sum(
        CASE
            WHEN (fund_code = 'zekat'::text) THEN amount_cents
            ELSE 0
        END) / 100) AS zekat,
    (sum(
        CASE
            WHEN (fund_code = 'sadaka'::text) THEN amount_cents
            ELSE 0
        END) / 100) AS sadaka,
    (sum(
        CASE
            WHEN (fund_code = 'general'::text) THEN amount_cents
            ELSE 0
        END) / 100) AS general,
    (sum(
        CASE
            WHEN (fund_code = 'cenaze'::text) THEN amount_cents
            ELSE 0
        END) / 100) AS cenaze,
    (sum(
        CASE
            WHEN (fund_code = 'fitre'::text) THEN amount_cents
            ELSE 0
        END) / 100) AS fitre
   FROM public.donations
  WHERE (created_at >= (CURRENT_DATE - '3 mons'::interval))
  GROUP BY (date(created_at))
  ORDER BY (date(created_at));


ALTER VIEW public.daily_donation_totals OWNER TO postgres;

--
-- Name: donation_funds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donation_funds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.donation_funds OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    day text NOT NULL,
    "time" text NOT NULL,
    phone text,
    is_recurring boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    date date
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: funds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.funds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    color text NOT NULL,
    ramadan_only boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.funds OWNER TO postgres;

--
-- Name: overrides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.overrides (
    id bigint NOT NULL,
    type text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT overrides_date_range_valid CHECK ((end_date >= start_date))
);


ALTER TABLE public.overrides OWNER TO postgres;

--
-- Name: TABLE overrides; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.overrides IS 'Human-entered prayer overrides, merged into prayer_cache at cron time. Service-role read only.';


--
-- Name: overrides_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.overrides ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.overrides_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: prayer_cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prayer_cache (
    date date NOT NULL,
    payload jsonb NOT NULL,
    fetched_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'ok'::text NOT NULL
);


ALTER TABLE public.prayer_cache OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_role_check CHECK ((role = 'admin'::text))
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscribers_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'unsubscribed'::character varying])::text[])))
);


ALTER TABLE public.subscribers OWNER TO postgres;

--
-- Name: TABLE subscribers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.subscribers IS 'Email subscriber list with status tracking';


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    date_of_birth date,
    notifications_enabled boolean DEFAULT true NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- Name: youth_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.youth_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    location text,
    date_time timestamp with time zone NOT NULL,
    is_free boolean DEFAULT true NOT NULL,
    price text,
    attending_count integer DEFAULT 0 NOT NULL,
    category text DEFAULT 'COMMUNITY'::text NOT NULL,
    image_url text,
    registration_link text,
    recurrence text DEFAULT 'none'::text NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT youth_events_recurrence_check CHECK ((recurrence = ANY (ARRAY['none'::text, 'weekly'::text, 'biweekly'::text, 'monthly'::text])))
);


ALTER TABLE public.youth_events OWNER TO postgres;

--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: donation_funds donation_funds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donation_funds
    ADD CONSTRAINT donation_funds_pkey PRIMARY KEY (id);


--
-- Name: donation_funds donation_funds_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donation_funds
    ADD CONSTRAINT donation_funds_slug_key UNIQUE (slug);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- Name: donations donations_stripe_event_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_stripe_event_id_key UNIQUE (stripe_event_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: funds funds_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funds
    ADD CONSTRAINT funds_code_key UNIQUE (code);


--
-- Name: funds funds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funds
    ADD CONSTRAINT funds_pkey PRIMARY KEY (id);


--
-- Name: overrides overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overrides
    ADD CONSTRAINT overrides_pkey PRIMARY KEY (id);


--
-- Name: prayer_cache prayer_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prayer_cache
    ADD CONSTRAINT prayer_cache_pkey PRIMARY KEY (date);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: subscribers subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_email_key UNIQUE (email);


--
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: youth_events youth_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.youth_events
    ADD CONSTRAINT youth_events_pkey PRIMARY KEY (id);


--
-- Name: idx_announcements_display_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_display_type ON public.announcements USING btree (display_type);


--
-- Name: idx_announcements_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_expires_at ON public.announcements USING btree (expires_at);


--
-- Name: idx_announcements_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_priority ON public.announcements USING btree (priority DESC);


--
-- Name: idx_announcements_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_published_at ON public.announcements USING btree (published_at DESC);


--
-- Name: idx_announcements_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_status ON public.announcements USING btree (status);


--
-- Name: idx_contacts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_created_at ON public.contacts USING btree (created_at DESC);


--
-- Name: idx_contacts_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_email ON public.contacts USING btree (email);


--
-- Name: idx_subscribers_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscribers_email ON public.subscribers USING btree (email);


--
-- Name: idx_subscribers_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscribers_status ON public.subscribers USING btree (status);


--
-- Name: overrides_date_range_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX overrides_date_range_idx ON public.overrides USING btree (start_date, end_date);


--
-- Name: announcements announcements_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER announcements_updated_at_trigger BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_announcements_updated_at();


--
-- Name: user_profiles on_user_profiles_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_user_profiles_updated BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: donation_funds update_donation_funds_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_donation_funds_updated_at BEFORE UPDATE ON public.donation_funds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: events update_events_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscribers update_subscribers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON public.subscribers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: donations donations_fund_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_fund_code_fkey FOREIGN KEY (fund_code) REFERENCES public.funds(code);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: youth_events Admin can delete events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can delete events" ON public.youth_events FOR DELETE USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: user_profiles Admin can delete profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can delete profiles" ON public.user_profiles FOR DELETE USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: youth_events Admin can insert events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can insert events" ON public.youth_events FOR INSERT WITH CHECK (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: user_profiles Admin can update all profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can update all profiles" ON public.user_profiles FOR UPDATE USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: youth_events Admin can update events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can update events" ON public.youth_events FOR UPDATE USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: user_profiles Admin can view all profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can view all profiles" ON public.user_profiles FOR SELECT USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: announcements Admins can manage announcements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage announcements" ON public.announcements TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: contacts Admins can manage contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage contacts" ON public.contacts TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: donation_funds Admins can manage donation funds; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage donation funds" ON public.donation_funds USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: events Admins can manage events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage events" ON public.events USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: funds Admins can manage funds; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage funds" ON public.funds USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: subscribers Admins can manage subscribers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage subscribers" ON public.subscribers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: prayer_cache Allow public select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public select" ON public.prayer_cache FOR SELECT USING (true);


--
-- Name: donation_funds Anyone can view active donation funds; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active donation funds" ON public.donation_funds FOR SELECT USING ((is_active = true));


--
-- Name: events Anyone can view active events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active events" ON public.events FOR SELECT USING ((is_active = true));


--
-- Name: contacts Anyone can view contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view contacts" ON public.contacts FOR SELECT USING (true);


--
-- Name: donations Only admins can view donations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can view donations" ON public.donations FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: funds Only admins can view funds; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can view funds" ON public.funds FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: youth_events Public can view published events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can view published events" ON public.youth_events FOR SELECT USING ((is_published = true));


--
-- Name: user_profiles User can insert own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "User can insert own profile" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: user_profiles User can update own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "User can update own profile" ON public.user_profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK (((auth.uid() = id) AND (NOT (admin_notes IS DISTINCT FROM ( SELECT user_profiles_1.admin_notes
   FROM public.user_profiles user_profiles_1
  WHERE (user_profiles_1.id = auth.uid()))))));


--
-- Name: user_profiles User can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "User can view own profile" ON public.user_profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: announcements; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

--
-- Name: contacts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: donation_funds; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.donation_funds ENABLE ROW LEVEL SECURITY;

--
-- Name: donations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: funds; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;

--
-- Name: overrides; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.overrides ENABLE ROW LEVEL SECURITY;

--
-- Name: prayer_cache; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.prayer_cache ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: subscribers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: youth_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.youth_events ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION handle_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_updated_at() TO anon;
GRANT ALL ON FUNCTION public.handle_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.handle_updated_at() TO service_role;


--
-- Name: FUNCTION update_announcements_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_announcements_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_announcements_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_announcements_updated_at() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: TABLE announcements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.announcements TO authenticated;
GRANT ALL ON TABLE public.announcements TO service_role;


--
-- Name: TABLE contacts; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,MAINTAIN ON TABLE public.contacts TO anon;
GRANT ALL ON TABLE public.contacts TO authenticated;
GRANT ALL ON TABLE public.contacts TO service_role;


--
-- Name: TABLE donations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.donations TO anon;
GRANT ALL ON TABLE public.donations TO authenticated;
GRANT ALL ON TABLE public.donations TO service_role;


--
-- Name: TABLE daily_donation_totals; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.daily_donation_totals TO authenticated;
GRANT ALL ON TABLE public.daily_donation_totals TO service_role;


--
-- Name: TABLE donation_funds; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.donation_funds TO anon;
GRANT ALL ON TABLE public.donation_funds TO authenticated;
GRANT ALL ON TABLE public.donation_funds TO service_role;


--
-- Name: TABLE events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.events TO anon;
GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;


--
-- Name: TABLE funds; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.funds TO anon;
GRANT ALL ON TABLE public.funds TO authenticated;
GRANT ALL ON TABLE public.funds TO service_role;


--
-- Name: TABLE overrides; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.overrides TO anon;
GRANT ALL ON TABLE public.overrides TO authenticated;
GRANT ALL ON TABLE public.overrides TO service_role;


--
-- Name: SEQUENCE overrides_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.overrides_id_seq TO anon;
GRANT ALL ON SEQUENCE public.overrides_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.overrides_id_seq TO service_role;


--
-- Name: TABLE prayer_cache; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.prayer_cache TO anon;
GRANT ALL ON TABLE public.prayer_cache TO authenticated;
GRANT ALL ON TABLE public.prayer_cache TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE subscribers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscribers TO authenticated;
GRANT ALL ON TABLE public.subscribers TO service_role;


--
-- Name: TABLE user_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_profiles TO anon;
GRANT ALL ON TABLE public.user_profiles TO authenticated;
GRANT ALL ON TABLE public.user_profiles TO service_role;


--
-- Name: TABLE youth_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.youth_events TO anon;
GRANT ALL ON TABLE public.youth_events TO authenticated;
GRANT ALL ON TABLE public.youth_events TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--


