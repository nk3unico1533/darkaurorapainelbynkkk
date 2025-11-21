CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'user',
    'premium',
    'admin',
    'owner'
);


--
-- Name: get_daily_credit_limit(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_daily_credit_limit(user_id uuid) RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
  user_role app_role;
BEGIN
  SELECT role INTO user_role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
  
  CASE user_role
    WHEN 'owner' THEN RETURN 999999;
    WHEN 'admin' THEN RETURN 999999;
    WHEN 'premium' THEN RETURN 25;
    ELSE RETURN 7;
  END CASE;
END;
$_$;


--
-- Name: get_user_credits(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_credits(user_id uuid) RETURNS TABLE(credits_remaining integer, daily_limit integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
  current_credits INTEGER;
  last_reset DATE;
  daily_limit INTEGER;
BEGIN
  daily_limit := public.get_daily_credit_limit(user_id);
  
  -- Get or create user credits record
  SELECT uc.credits_remaining, uc.last_reset_date 
  INTO current_credits, last_reset
  FROM public.user_credits uc
  WHERE uc.user_id = $1;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, credits_remaining, last_reset_date)
    VALUES (user_id, daily_limit, CURRENT_DATE)
    RETURNING user_credits.credits_remaining INTO current_credits;
    
    RETURN QUERY SELECT current_credits, daily_limit;
    RETURN;
  END IF;
  
  -- Reset credits if it's a new day
  IF last_reset < CURRENT_DATE THEN
    UPDATE public.user_credits
    SET credits_remaining = daily_limit,
        last_reset_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_credits.user_id = $1
    RETURNING user_credits.credits_remaining INTO current_credits;
  END IF;
  
  RETURN QUERY SELECT current_credits, daily_limit;
END;
$_$;


--
-- Name: get_user_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role(user_id uuid) RETURNS public.app_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$_$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$;


--
-- Name: handle_new_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: use_credit(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.use_credit(user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
  current_credits INTEGER;
  daily_limit INTEGER;
BEGIN
  -- Get current credits (this also resets if needed)
  SELECT credits_remaining INTO current_credits
  FROM public.get_user_credits(user_id);
  
  -- Check if user has credits
  IF current_credits <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct one credit
  UPDATE public.user_credits
  SET credits_remaining = credits_remaining - 1,
      updated_at = now()
  WHERE user_credits.user_id = $1;
  
  RETURN TRUE;
END;
$_$;


SET default_table_access_method = heap;

--
-- Name: consultation_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultation_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    module text NOT NULL,
    route text NOT NULL,
    query text NOT NULL,
    result jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_credits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_credits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credits_remaining integer DEFAULT 7 NOT NULL,
    last_reset_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: consultation_history consultation_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_history
    ADD CONSTRAINT consultation_history_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_credits update_user_credits_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: consultation_history consultation_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultation_history
    ADD CONSTRAINT consultation_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_credits user_credits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Only owners can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only owners can manage roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'owner'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'owner'::public.app_role));


--
-- Name: user_credits Owners and admins can view all credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and admins can view all credits" ON public.user_credits FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Owners and admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'owner'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles Profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);


--
-- Name: consultation_history Users can delete their own consultation history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own consultation history" ON public.consultation_history FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: consultation_history Users can insert their own consultation history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own consultation history" ON public.consultation_history FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: consultation_history Users can view their own consultation history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own consultation history" ON public.consultation_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_credits Users can view their own credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own credits" ON public.user_credits FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: consultation_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.consultation_history ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_credits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


