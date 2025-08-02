-- Add new tables for enhanced features

-- Table for tracking who has gifted you
CREATE TABLE IF NOT EXISTS received_gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  gift_description TEXT,
  received_date DATE NOT NULL,
  gift_type TEXT,
  value DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for social media integrations
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'facebook', 'instagram', 'linkedin', 'google'
  platform_user_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for calendar integrations
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'google', 'apple', 'outlook'
  calendar_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for bulk uploads
CREATE TABLE IF NOT EXISTS bulk_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_type TEXT NOT NULL, -- 'people', 'gifts', 'events'
  file_name TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  error_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for payments and transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- 'pending', 'succeeded', 'failed', 'refunded'
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for gift cards and returns
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
  card_code TEXT UNIQUE NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  remaining_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'used', 'expired', 'returned'
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for returns and refunds
CREATE TABLE IF NOT EXISTS returns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
  return_reason TEXT,
  return_amount DECIMAL(10,2) NOT NULL,
  processing_fee DECIMAL(10,2) DEFAULT 0,
  net_refund_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'processed', 'rejected'
  stripe_refund_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for shipping and tracking
CREATE TABLE IF NOT EXISTS shipments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
  tracking_number TEXT,
  carrier TEXT, -- 'fedex', 'ups', 'usps', 'dhl'
  shipping_address JSONB,
  status TEXT DEFAULT 'pending', -- 'pending', 'shipped', 'delivered', 'returned'
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  tracking_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for gift templates
CREATE TABLE IF NOT EXISTS gift_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  gift_amount TEXT NOT NULL,
  personal_message TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  reminder_days INTEGER[] DEFAULT ARRAY[10, 3, 1],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_received_gifts_user_id ON received_gifts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_uploads_user_id ON bulk_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_gift_id ON payments(gift_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_user_id ON gift_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_gift_id ON gift_cards(gift_id);
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_gift_id ON returns(gift_id);
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_gift_id ON shipments(gift_id);
CREATE INDEX IF NOT EXISTS idx_gift_templates_user_id ON gift_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Add RLS policies
ALTER TABLE received_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own received gifts" ON received_gifts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own received gifts" ON received_gifts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own received gifts" ON received_gifts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own received gifts" ON received_gifts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own social connections" ON social_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own social connections" ON social_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own social connections" ON social_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own social connections" ON social_connections FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own calendar integrations" ON calendar_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own calendar integrations" ON calendar_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar integrations" ON calendar_integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar integrations" ON calendar_integrations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own bulk uploads" ON bulk_uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bulk uploads" ON bulk_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bulk uploads" ON bulk_uploads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bulk uploads" ON bulk_uploads FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payments" ON payments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own gift cards" ON gift_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own gift cards" ON gift_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own gift cards" ON gift_cards FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own returns" ON returns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own returns" ON returns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own returns" ON returns FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own shipments" ON shipments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shipments" ON shipments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shipments" ON shipments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own gift templates" ON gift_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own gift templates" ON gift_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own gift templates" ON gift_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own gift templates" ON gift_templates FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notification preferences" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification preferences" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification preferences" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_received_gifts_updated_at BEFORE UPDATE ON received_gifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_connections_updated_at BEFORE UPDATE ON social_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_integrations_updated_at BEFORE UPDATE ON calendar_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bulk_uploads_updated_at BEFORE UPDATE ON bulk_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gift_cards_updated_at BEFORE UPDATE ON gift_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON returns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gift_templates_updated_at BEFORE UPDATE ON gift_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 