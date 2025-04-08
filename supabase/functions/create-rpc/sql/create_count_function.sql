
-- Create a function to count push subscriptions
CREATE OR REPLACE FUNCTION public.count_push_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.push_subscriptions
  );
END;
$$;

-- Grant usage to authenticated users
GRANT EXECUTE ON FUNCTION public.count_push_subscriptions() TO authenticated;
