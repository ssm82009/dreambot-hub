
-- Create a function to count FCM tokens
CREATE OR REPLACE FUNCTION public.count_fcm_tokens()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) FROM public.fcm_tokens;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.count_fcm_tokens() TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_fcm_tokens() TO service_role;
