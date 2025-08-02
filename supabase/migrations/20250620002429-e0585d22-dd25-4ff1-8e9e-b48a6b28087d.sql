
-- Create profiles table for user data and settings
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY, -- Changed back to uuid for Supabase Auth user IDs
  updated_at timestamp with time zone DEFAULT now(),
  full_name text,
  email text,
  defaults jsonb DEFAULT '{"giftAmount": "Personal Note and photo ($5)", "signature": "With love,"}',
  notifications jsonb DEFAULT '{"reminders": {"days_10": true}}'
);

-- Create people table for gift recipients
CREATE TABLE public.people (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, -- Changed back to uuid for Supabase Auth user IDs
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  nickname text,
  birthday date,
  anniversary date,
  address jsonb
);

-- Create gifts table for individual gift instances
CREATE TABLE public.gifts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, -- Changed back to uuid for Supabase Auth user IDs
  recipient_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  gift_id_string text,
  relationship text,
  event_type text,
  event_date timestamp with time zone,
  gift_amount text,
  personal_message text,
  photo_url text,
  status text DEFAULT 'not-started'
);

-- Note: RLS is disabled for now to allow the application to work
-- We can add proper security policies later when needed
