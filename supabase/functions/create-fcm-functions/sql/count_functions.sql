
-- Create count_user_fcm_tokens function
CREATE OR REPLACE FUNCTION count_user_fcm_tokens(p_user_id UUID) 
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM fcm_tokens 
    WHERE user_id = p_user_id
  );
END;
$$;

-- Function creator for count_user_fcm_tokens
CREATE OR REPLACE FUNCTION create_count_user_fcm_tokens()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE $FUNC$
    CREATE OR REPLACE FUNCTION count_user_fcm_tokens(p_user_id UUID) 
    RETURNS INTEGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $INNER$
    BEGIN
      RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM fcm_tokens 
        WHERE user_id = p_user_id
      );
    END;
    $INNER$;
  $FUNC$;
END;
$$;
