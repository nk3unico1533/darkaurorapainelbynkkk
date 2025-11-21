-- Create table for user bans and restrictions
CREATE TABLE public.user_moderation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  moderator_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('ban', 'restrict', 'warn')),
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_moderation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_moderation
CREATE POLICY "Owners and admins can view all moderation actions"
ON public.user_moderation
FOR SELECT
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners and admins can insert moderation actions"
ON public.user_moderation
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners and admins can update moderation actions"
ON public.user_moderation
FOR UPDATE
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_user_moderation_updated_at
BEFORE UPDATE ON public.user_moderation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_moderation
    WHERE user_moderation.user_id = $1
      AND action_type = 'ban'
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- Update RLS policies for user_roles to only allow owner and admin to manage roles
DROP POLICY IF EXISTS "Only owners can manage roles" ON public.user_roles;

CREATE POLICY "Owners and admins can manage roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'));