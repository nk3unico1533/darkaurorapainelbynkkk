-- Add username, numeric_id and last_username_change to profiles table
ALTER TABLE public.profiles
ADD COLUMN username text UNIQUE,
ADD COLUMN numeric_id serial,
ADD COLUMN last_username_change timestamp with time zone DEFAULT now();

-- Create index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Update the handle_new_user function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'username'
  );
  RETURN new;
END;
$$;

-- Create function to update username with 7-day restriction
CREATE OR REPLACE FUNCTION public.update_username(
  user_id uuid,
  new_username text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_change timestamp with time zone;
  days_since_change integer;
BEGIN
  -- Check if user exists and get last change date
  SELECT last_username_change INTO last_change
  FROM public.profiles
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Calculate days since last change
  days_since_change := EXTRACT(day FROM now() - last_change);
  
  -- Check if 7 days have passed
  IF days_since_change < 7 THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Você só pode mudar seu username a cada 7 dias',
      'days_remaining', 7 - days_since_change
    );
  END IF;
  
  -- Check if username is already taken
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username AND id != user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Username já está em uso');
  END IF;
  
  -- Update username
  UPDATE public.profiles
  SET username = new_username,
      last_username_change = now(),
      updated_at = now()
  WHERE id = user_id;
  
  RETURN json_build_object('success', true, 'message', 'Username atualizado com sucesso');
END;
$$;