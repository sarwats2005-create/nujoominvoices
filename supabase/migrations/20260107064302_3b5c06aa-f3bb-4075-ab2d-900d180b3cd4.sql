-- Create audit log table for invoice tracking
CREATE TABLE public.invoice_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.invoice_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.invoice_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.invoice_audit_log
FOR SELECT
USING (auth.uid() = user_id);

-- Allow inserts from authenticated users (for their own actions)
CREATE POLICY "Authenticated users can create audit logs"
ON public.invoice_audit_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_invoice_audit_log_invoice_id ON public.invoice_audit_log(invoice_id);
CREATE INDEX idx_invoice_audit_log_user_id ON public.invoice_audit_log(user_id);
CREATE INDEX idx_invoice_audit_log_created_at ON public.invoice_audit_log(created_at DESC);

-- Create function to log invoice changes
CREATE OR REPLACE FUNCTION public.log_invoice_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.invoice_audit_log (invoice_id, user_id, action, new_data)
    VALUES (NEW.id, NEW.user_id, 'create', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.invoice_audit_log (invoice_id, user_id, action, old_data, new_data)
    VALUES (NEW.id, NEW.user_id, 'update', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.invoice_audit_log (invoice_id, user_id, action, old_data)
    VALUES (OLD.id, OLD.user_id, 'delete', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for invoice audit logging
CREATE TRIGGER invoice_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.log_invoice_change();

-- Update handle_new_user function to make sarwats2005@gmail.com the only admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_email TEXT := 'sarwats2005@gmail.com';
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Assign admin role ONLY to the designated email, all others get user role
  IF NEW.email = admin_email THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create rate limiting table for tracking login attempts
CREATE TABLE public.auth_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- email or IP
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('login', 'signup', 'password_reset')),
  attempt_count INTEGER NOT NULL DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  UNIQUE(identifier, attempt_type)
);

-- Enable RLS on rate limits (only accessible via edge functions with service role)
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_attempt_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15,
  p_block_minutes INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record public.auth_rate_limits%ROWTYPE;
  v_now TIMESTAMP WITH TIME ZONE := now();
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_result JSONB;
BEGIN
  v_window_start := v_now - (p_window_minutes || ' minutes')::interval;
  
  -- Get existing record
  SELECT * INTO v_record
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier AND attempt_type = p_attempt_type;
  
  -- Check if blocked
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'blocked_until', v_record.blocked_until,
      'remaining_seconds', EXTRACT(EPOCH FROM (v_record.blocked_until - v_now))::integer
    );
  END IF;
  
  -- If no record or window expired, create/reset
  IF v_record.id IS NULL OR v_record.first_attempt_at < v_window_start THEN
    INSERT INTO public.auth_rate_limits (identifier, attempt_type, attempt_count, first_attempt_at, last_attempt_at, blocked_until)
    VALUES (p_identifier, p_attempt_type, 1, v_now, v_now, NULL)
    ON CONFLICT (identifier, attempt_type)
    DO UPDATE SET attempt_count = 1, first_attempt_at = v_now, last_attempt_at = v_now, blocked_until = NULL;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'blocked', false,
      'attempts_remaining', p_max_attempts - 1
    );
  END IF;
  
  -- Increment attempts
  IF v_record.attempt_count >= p_max_attempts THEN
    -- Block the user
    UPDATE public.auth_rate_limits
    SET blocked_until = v_now + (p_block_minutes || ' minutes')::interval,
        last_attempt_at = v_now
    WHERE identifier = p_identifier AND attempt_type = p_attempt_type;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'blocked_until', v_now + (p_block_minutes || ' minutes')::interval,
      'remaining_seconds', p_block_minutes * 60
    );
  ELSE
    -- Update attempt count
    UPDATE public.auth_rate_limits
    SET attempt_count = attempt_count + 1,
        last_attempt_at = v_now
    WHERE identifier = p_identifier AND attempt_type = p_attempt_type;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'blocked', false,
      'attempts_remaining', p_max_attempts - v_record.attempt_count - 1
    );
  END IF;
END;
$$;

-- Function to clear rate limit after successful auth
CREATE OR REPLACE FUNCTION public.clear_rate_limit(
  p_identifier TEXT,
  p_attempt_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.auth_rate_limits
  WHERE identifier = p_identifier AND attempt_type = p_attempt_type;
END;
$$;