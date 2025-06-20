
-- Create profiles table for user data and settings
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT auth.uid() PRIMARY KEY,
  updated_at timestamp with time zone DEFAULT now(),
  full_name text,
  email text,
  defaults jsonb DEFAULT '{"giftAmount": "Personal Note and photo ($5)", "signature": "With love,"}',
  notifications jsonb DEFAULT '{"reminders": {"days_10": true}}'
);

-- Create people table for gift recipients
CREATE TABLE public.people (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for people
CREATE POLICY "Users can manage own people" ON public.people
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for gifts
CREATE POLICY "Users can manage own gifts" ON public.gifts
  FOR ALL USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
