-- Create received_gifts table to track gifts received by users
CREATE TABLE public.received_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  gift_description TEXT NOT NULL,
  received_date DATE NOT NULL,
  gift_type TEXT,
  value DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.received_gifts ENABLE ROW LEVEL SECURITY;

-- Create policies for received_gifts
CREATE POLICY "Users can view their own received gifts" 
ON public.received_gifts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own received gifts" 
ON public.received_gifts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own received gifts" 
ON public.received_gifts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own received gifts" 
ON public.received_gifts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_received_gifts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_received_gifts_updated_at
BEFORE UPDATE ON public.received_gifts
FOR EACH ROW
EXECUTE FUNCTION public.update_received_gifts_updated_at();