
-- Function to get latest payment invoices
CREATE OR REPLACE FUNCTION public.get_latest_payment_invoices()
 RETURNS SETOF payment_invoices
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH latest_invoices AS (
    SELECT DISTINCT ON (invoice_id) *
    FROM payment_invoices
    ORDER BY invoice_id, created_at DESC
  )
  SELECT * FROM latest_invoices
  ORDER BY created_at DESC;
END;
$function$;

-- You can run this SQL in the Supabase SQL Editor to create the function
