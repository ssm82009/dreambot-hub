
-- Function to check if token exists
CREATE OR REPLACE FUNCTION check_fcm_token_exists(p_token TEXT, p_user_id UUID) 
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM fcm_tokens 
    WHERE token = p_token AND user_id = p_user_id
  );
END;
$$;

-- Function to insert a new FCM token
CREATE OR REPLACE FUNCTION insert_fcm_token(p_user_id UUID, p_token TEXT) 
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO fcm_tokens (user_id, token)
  VALUES (p_user_id, p_token);
END;
$$;

-- Function to delete a specific FCM token
CREATE OR REPLACE FUNCTION delete_fcm_token(p_token TEXT, p_user_id UUID) 
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM fcm_tokens
  WHERE token = p_token AND user_id = p_user_id;
END;
$$;

-- Function to delete all FCM tokens for a user
CREATE OR REPLACE FUNCTION delete_all_user_fcm_tokens(p_user_id UUID) 
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM fcm_tokens
  WHERE user_id = p_user_id;
END;
$$;
