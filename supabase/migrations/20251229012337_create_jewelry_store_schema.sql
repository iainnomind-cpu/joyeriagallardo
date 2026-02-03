/*
  # Jewelry Store Database Schema

  ## Overview
  Creates the complete database structure for a jewelry e-commerce application with products, orders, and admin authentication.

  ## New Tables
  
  ### 1. `categories`
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text, unique) - Category name (e.g., "Perlas", "Zirconia", "Monedas")
  - `created_at` (timestamptz) - Timestamp of creation
  
  ### 2. `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `codigo` (text, unique) - Product code (e.g., "P014", "Z047")
  - `precio` (numeric) - Product price
  - `categoria_id` (uuid, foreign key) - Reference to categories table
  - `imagen_url` (text) - URL to product image stored in Supabase Storage
  - `descripcion` (text) - Product description
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update
  
  ### 3. `orders`
  - `id` (uuid, primary key) - Unique order identifier
  - `nombre` (text) - Customer name
  - `telefono` (text) - Customer phone
  - `tipo_entrega` (text) - Delivery type ("recoger" or "envio")
  - `calle` (text) - Street address (for delivery)
  - `numero_exterior` (text) - Exterior number
  - `numero_interior` (text) - Interior number
  - `colonia` (text) - Neighborhood
  - `ciudad` (text) - City
  - `estado` (text) - State
  - `codigo_postal` (text) - Postal code
  - `referencias` (text) - Additional references
  - `total` (numeric) - Order total amount
  - `status` (text) - Order status ("pendiente", "completado", "cancelado")
  - `created_at` (timestamptz) - Timestamp of order creation
  
  ### 4. `order_items`
  - `id` (uuid, primary key) - Unique item identifier
  - `order_id` (uuid, foreign key) - Reference to orders table
  - `product_id` (uuid, foreign key) - Reference to products table
  - `codigo` (text) - Product code at time of purchase
  - `precio` (numeric) - Product price at time of purchase
  - `cantidad` (integer) - Quantity ordered
  - `categoria` (text) - Category at time of purchase
  
  ## Security
  - Enable RLS on all tables
  - Public read access for categories and products (anyone can view catalog)
  - Admin-only write access for categories and products
  - Admin-only access for orders
  - Policies check authentication for admin operations

  ## Notes
  - All tables use UUID primary keys with automatic generation
  - Timestamps are automatically managed
  - Foreign key constraints ensure data integrity
  - RLS policies are restrictive by default
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  precio numeric NOT NULL CHECK (precio >= 0),
  categoria_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  imagen_url text DEFAULT '',
  descripcion text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  telefono text NOT NULL,
  tipo_entrega text NOT NULL DEFAULT 'recoger',
  calle text DEFAULT '',
  numero_exterior text DEFAULT '',
  numero_interior text DEFAULT '',
  colonia text DEFAULT '',
  ciudad text DEFAULT '',
  estado text DEFAULT '',
  codigo_postal text DEFAULT '',
  referencias text DEFAULT '',
  total numeric NOT NULL CHECK (total >= 0),
  status text DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  codigo text NOT NULL,
  precio numeric NOT NULL CHECK (precio >= 0),
  cantidad integer NOT NULL CHECK (cantidad > 0),
  categoria text NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories policies: Public read, admin write
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Products policies: Public read, admin write
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Orders policies: Admin only
CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Order items policies: Admin only
CREATE POLICY "Authenticated users can view order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Insert initial categories
INSERT INTO categories (name) VALUES 
  ('Perlas'),
  ('Zirconia'),
  ('Monedas')
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
