/*
  # Create Customers and Orders Tables

  1. New Tables
    - `customers`
      - `id` (uuid, primary key) - Links to auth.users
      - `email` (text) - Customer email
      - `first_name` (text) - First name
      - `last_name` (text) - Last name
      - `phone` (text) - Phone number
      - `street_address` (text, nullable) - Street address
      - `city` (text, nullable) - City
      - `zip_code` (text, nullable) - Zip code
      - `created_at` (timestamptz) - Account creation timestamp
      
    - `orders`
      - `id` (uuid, primary key) - Order identifier
      - `customer_id` (uuid, foreign key) - References customers
      - `order_type` (text) - 'pickup' or 'delivery'
      - `payment_method` (text) - 'cash' or 'card'
      - `items` (jsonb) - Order items with customizations
      - `subtotal` (numeric) - Subtotal amount
      - `tax` (numeric) - Tax amount
      - `tip` (numeric, default 0) - Tip amount
      - `total` (numeric) - Total amount
      - `delivery_address` (text, nullable) - Delivery address if applicable
      - `special_instructions` (text, nullable) - Order notes
      - `status` (text, default 'pending') - Order status
      - `created_at` (timestamptz) - Order creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - Customers can view and update their own profile
    - Customers can view their own orders and create new orders
    - Only authenticated users can access data
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  street_address text,
  city text,
  zip_code text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_type text NOT NULL CHECK (order_type IN ('pickup', 'delivery')),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card')),
  items jsonb NOT NULL,
  subtotal numeric(10, 2) NOT NULL,
  tax numeric(10, 2) NOT NULL,
  tip numeric(10, 2) DEFAULT 0,
  total numeric(10, 2) NOT NULL,
  delivery_address text,
  special_instructions text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Create index for faster order queries
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);