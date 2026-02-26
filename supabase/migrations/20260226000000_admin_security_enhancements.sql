-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGIN_FAILED, EXPORT
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'article', 'listing', 'user', 'settings'
    entity_id VARCHAR(255),
    changes JSONB, -- The modified data or diff
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying audit logs efficiently
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_user_id ON public.admin_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity ON public.admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- Enable RLS on audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs" 
    ON public.admin_audit_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- System can insert audit logs (via service role)
CREATE POLICY "Service role can insert audit logs" 
    ON public.admin_audit_logs FOR INSERT 
    WITH CHECK (true);

-- Create content versions table for version control
CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'article', 'listing', 'page'
    entity_id VARCHAR(255) NOT NULL,
    version_num INTEGER NOT NULL,
    content JSONB NOT NULL, -- Complete snapshot of the entity
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    commit_message VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, version_num)
);

-- Indexes for version control
CREATE INDEX IF NOT EXISTS idx_content_versions_entity ON public.content_versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_at ON public.content_versions(created_at DESC);

-- Enable RLS on content versions
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage versions
CREATE POLICY "Admins can view content versions" 
    ON public.content_versions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can insert content versions" 
    ON public.content_versions FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );
