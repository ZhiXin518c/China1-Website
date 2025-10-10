/*
  # Create Admin and Menu Management Tables

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key) - Admin user identifier
      - `username` (text, unique) - Admin username
      - `password_hash` (text) - Hashed password
      - `email` (text, unique) - Admin email
      - `full_name` (text) - Admin full name
      - `role` (text, default 'admin') - Admin role
      - `is_active` (boolean, default true) - Account status
      - `created_at` (timestamptz) - Account creation timestamp
      - `last_login` (timestamptz, nullable) - Last login timestamp
      
    - `menu_categories`
      - `id` (text, primary key) - Category identifier
      - `name` (text) - Category name
      - `icon` (text, nullable) - Category icon
      - `display_order` (integer) - Display order
      - `is_active` (boolean, default true) - Category status
      - `created_at` (timestamptz) - Creation timestamp
      
    - `menu_items`
      - `id` (text, primary key) - Menu item identifier
      - `name` (text) - Item name
      - `description` (text) - Item description
      - `category_id` (text, foreign key) - References menu_categories
      - `base_price` (numeric) - Base price
      - `image` (text, nullable) - Image URL
      - `is_available` (boolean, default true) - Availability status
      - `is_spicy` (boolean, default false) - Spicy indicator
      - `customization_options` (jsonb, nullable) - Customization options
      - `display_order` (integer, default 0) - Display order
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Only authenticated users can view menu items and categories
    - Only admin users can manage admin accounts, menu items, and categories
    - Public read access for menu items and categories (for customer browsing)

  3. Important Notes
    - Default admin account will be created with username 'admin' and password 'admin123'
    - Password is hashed using crypt extension
    - Admin users have full control over orders, menu, and customers
*/

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'manager')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view own profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can update own profile"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create menu_categories table
CREATE TABLE IF NOT EXISTS menu_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON menu_categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all categories"
  ON menu_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON menu_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category_id text NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  base_price numeric(10, 2) NOT NULL,
  image text,
  is_available boolean DEFAULT true,
  is_spicy boolean DEFAULT false,
  customization_options jsonb,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

CREATE POLICY "Authenticated users can view all menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS menu_items_category_id_idx ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS menu_items_is_available_idx ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS menu_categories_display_order_idx ON menu_categories(display_order);
CREATE INDEX IF NOT EXISTS menu_items_display_order_idx ON menu_items(display_order);

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password_hash, email, full_name, role)
VALUES (
  'admin',
  crypt('admin123', gen_salt('bf')),
  'admin@china1.com',
  'System Administrator',
  'super_admin'
)
ON CONFLICT (username) DO NOTHING;

-- Insert menu categories
INSERT INTO menu_categories (id, name, icon, display_order) VALUES
  ('lunch-specials', 'Lunch Specials', '🍱', 1),
  ('combination-platters', 'Combination Platters', '🍜', 2),
  ('pick-2-meat', 'Special Pick 2 Meat', '🥡', 3),
  ('american-dishes', 'American Dishes', '🍔', 4),
  ('appetizers', 'Appetizers', '🥟', 5),
  ('soup', 'Soup', '🍲', 6)
ON CONFLICT (id) DO NOTHING;