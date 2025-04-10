
-- Create check_fcm_token_exists function creator
CREATE OR REPLACE FUNCTION create_check_fcm_token_exists()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE $FUNC$
    CREATE OR REPLACE FUNCTION check_fcm_token_exists(p_token TEXT, p_user_id UUID) 
    RETURNS INTEGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $INNER$
    BEGIN
      RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM fcm_tokens 
        WHERE token = p_token AND user_id = p_user_id
      );
    END;
    $INNER$;
  $FUNC$;
END;
$$;

-- Create insert_fcm_token function creator
CREATE OR REPLACE FUNCTION create_insert_fcm_token()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE $FUNC$
    CREATE OR REPLACE FUNCTION insert_fcm_token(p_user_id UUID, p_token TEXT) 
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $INNER$
    BEGIN
      INSERT INTO fcm_tokens (user_id, token)
      VALUES (p_user_id, p_token);
    END;
    $INNER$;
  $FUNC$;
END;
$$;

-- Create delete_fcm_token function creator
CREATE OR REPLACE FUNCTION create_delete_fcm_token()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE $FUNC$
    CREATE OR REPLACE FUNCTION delete_fcm_token(p_token TEXT, p_user_id UUID) 
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $INNER$
    BEGIN
      DELETE FROM fcm_tokens
      WHERE token = p_token AND user_id = p_user_id;
    END;
    $INNER$;
  $FUNC$;
END;
$$;

-- Create delete_all_user_fcm_tokens function creator
CREATE OR REPLACE FUNCTION create_delete_all_user_fcm_tokens()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE $FUNC$
    CREATE OR REPLACE FUNCTION delete_all_user_fcm_tokens(p_user_id UUID) 
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $INNER$
    BEGIN
      DELETE FROM fcm_tokens
      WHERE user_id = p_user_id;
    END;
    $INNER$;
  $FUNC$;
END;
$$;
