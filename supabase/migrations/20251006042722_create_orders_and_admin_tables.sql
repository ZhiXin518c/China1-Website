/*
  # Create orders and admin tables

  1. New Tables
    - `orders`
      - `id` (uuid, primary key) - Order identifier
      - `customer_id` (uuid, foreign key) - References customers table
      - `customer_name` (text) - Customer name
      - `customer_phone` (text) - Customer phone
      - `customer_email` (text) - Customer email
      - `order_type` (text) - 'pickup' or 'delivery'
      - `payment_method` (text) - 'cash' or 'card'
      - `special_instructions` (text) - Order notes
      - `subtotal` (decimal) - Order subtotal
      - `tax` (decimal) - Tax amount
      - `delivery_fee` (decimal) - Delivery fee
      - `total` (decimal) - Total amount
      - `status` (text) - Order status
      - `created_at` (timestamptz) - Order creation time
      - `estimated_ready_time` (timestamptz) - Estimated ready time
      - `completed_at` (timestamptz) - Completion time

    - `order_items`
      - `id` (uuid, primary key) - Item identifier
      - `order_id` (uuid, foreign key) - References orders
      - `menu_item_id` (text) - Menu item identifier
      - `name` (text) - Item name
      - `quantity` (integer) - Item quantity
      - `base_price` (decimal) - Base price per item
      - `final_price` (decimal) - Final price (with customizations)
      - `customizations` (jsonb) - Item customizations
      - `special_instructions` (text) - Item notes

    - `admin_users`
      - `id` (uuid, primary key) - References auth.users
      - `email` (text, unique) - Admin email
      - `full_name` (text) - Admin name
      - `role` (text) - Admin role
      - `created_at` (timestamptz) - Account creation

  2. Security
    - Enable RLS on all tables
    - Customers can view their own orders
    - Admin users can view and manage all orders
    - Admin users can manage menu items
*/

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  order_type text NOT NULL DEFAULT 'pickup',
  payment_method text NOT NULL DEFAULT 'cash',
  special_instructions text DEFAULT '',
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax decimal(10,2) NOT NULL DEFAULT 0,
  delivery_fee decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  estimated_ready_time timestamptz,
  completed_at timestamptz
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id text NOT NULL,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  base_price decimal(10,2) NOT NULL DEFAULT 0,
  final_price decimal(10,2) NOT NULL DEFAULT 0,
  customizations jsonb DEFAULT '{}',
  special_instructions text DEFAULT ''
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Customers can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Admin users can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admin users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Order items policies
CREATE POLICY "Users can view order items for their orders"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update order items"
  ON order_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users policies
CREATE POLICY "Admin users can view all admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users AS au
      WHERE au.id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
