-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'premium', 'admin', 'owner');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create user_credits table
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 7,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Function to get daily credit limit based on role
CREATE OR REPLACE FUNCTION public.get_daily_credit_limit(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Function to reset credits if needed and return current credits
CREATE OR REPLACE FUNCTION public.get_user_credits(user_id UUID)
RETURNS TABLE(credits_remaining INTEGER, daily_limit INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Function to use one credit
CREATE OR REPLACE FUNCTION public.use_credit(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owners and admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'owner') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only owners can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- RLS Policies for user_credits
CREATE POLICY "Users can view their own credits"
ON public.user_credits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owners and admins can view all credits"
ON public.user_credits
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'owner') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Trigger to create user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();

-- Trigger for updated_at on user_credits
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();