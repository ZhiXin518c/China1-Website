/*
  # Create customers table for authentication

  1. New Tables
    - `customers`
      - `id` (uuid, primary key) - References auth.users
      - `email` (text, unique, not null) - Customer email address
      - `first_name` (text, not null) - Customer first name
      - `last_name` (text, not null) - Customer last name
      - `phone` (text, not null) - Customer phone number
      - `street_address` (text) - Optional street address
      - `city` (text) - Optional city
      - `zip_code` (text) - Optional zip code
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `customers` table
    - Add policy for users to read their own data
    - Add policy for users to update their own data
    - Add policy for users to insert their own data (during registration)
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  street_address text DEFAULT '',
  city text DEFAULT '',
  zip_code text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own customer data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own customer data"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own customer data"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
