/*
  # Create Admin Login Function

  1. Functions
    - `admin_login` - Validates admin credentials and returns admin user data
      - Takes username and password as parameters
      - Uses crypt to verify password hash
      - Returns admin user data if valid, empty array if invalid
      
  2. Security
    - Function executes with security definer to access admin_users table
    - Only returns data for active admin accounts
    - Does not expose password hash in response
*/

-- Create admin login function
CREATE OR REPLACE FUNCTION admin_login(p_username text, p_password text)
RETURNS TABLE (
  id uuid,
  username text,
  email text,
  full_name text,
  role text,
  is_active boolean,
  created_at timestamptz,
  last_login timestamptz
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.username,
    a.email,
    a.full_name,
    a.role,
    a.is_active,
    a.created_at,
    a.last_login
  FROM admin_users a
  WHERE a.username = p_username
    AND a.password_hash = crypt(p_password, a.password_hash)
    AND a.is_active = true;
END;
$$;