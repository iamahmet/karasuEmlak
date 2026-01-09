-- Create ai_image_settings table for storing AI image generation settings
-- This replaces localStorage-based settings with database persistence

CREATE TABLE IF NOT EXISTS ai_image_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO ai_image_settings (setting_key, setting_value, description)
VALUES 
  (
    'rate_limits',
    '{
      "maxRequestsPerHour": 20,
      "maxRequestsPerDay": 100,
      "maxCostPerDay": 10.0
    }'::jsonb,
    'Rate limit configuration for AI image generation'
  ),
  (
    'default_options',
    '{
      "size": "1792x1024",
      "quality": "hd",
      "style": "natural"
    }'::jsonb,
    'Default options for AI image generation'
  )
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_image_settings_key ON ai_image_settings(setting_key);

-- Enable RLS
ALTER TABLE ai_image_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Service role can do everything
CREATE POLICY "Service role full access" ON ai_image_settings
  FOR ALL
  USING (auth.role() = 'service_role');

-- Public read access (for client-side)
CREATE POLICY "Public read access" ON ai_image_settings
  FOR SELECT
  USING (true);

-- Admin write access (requires staff role check in application)
-- Note: This is a basic policy, actual admin check should be done in API
CREATE POLICY "Admin write access" ON ai_image_settings
  FOR ALL
  USING (true); -- Will be restricted by API-level auth

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ai_image_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_image_settings_updated_at
  BEFORE UPDATE ON ai_image_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_image_settings_updated_at();

-- Add comment
COMMENT ON TABLE ai_image_settings IS 'Stores AI image generation settings and rate limits';
