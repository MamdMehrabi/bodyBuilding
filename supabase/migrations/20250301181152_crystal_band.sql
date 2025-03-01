/*
  # Initial Database Schema for Bashgah Yab

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text, nullable)
      - `role` (text)
      - `favorite_sports` (text array, nullable)
    
    - `clubs`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `name` (text)
      - `description` (text)
      - `address` (text)
      - `latitude` (float)
      - `longitude` (float)
      - `owner_id` (uuid, references auth.users)
      - `is_premium` (boolean)
      - `is_approved` (boolean)
      - `sports` (text array)
      - `facilities` (text array)
      - `price_range` (text)
      - `images` (text array)
      - `rating` (float, nullable)
      - `city` (text)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `club_id` (uuid, references clubs)
      - `user_id` (uuid, references auth.users)
      - `rating` (integer)
      - `comment` (text)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `club_id` (uuid, references clubs)
      - `user_id` (uuid, references auth.users)
      - `date` (timestamp)
      - `status` (text)
      - `payment_status` (text)
      - `amount` (integer)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read and write their own data
    - Add policies for club owners to manage their clubs
    - Add policies for admins to manage all data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  role text NOT NULL,
  favorite_sports text[] DEFAULT '{}'::text[]
);

-- Create clubs table
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text NOT NULL,
  address text NOT NULL,
  latitude float NOT NULL,
  longitude float NOT NULL,
  owner_id uuid REFERENCES auth.users NOT NULL,
  is_premium boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  sports text[] NOT NULL,
  facilities text[] DEFAULT '{}'::text[],
  price_range text NOT NULL,
  images text[] DEFAULT '{}'::text[],
  rating float,
  city text NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  club_id uuid REFERENCES clubs ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  rating integer NOT NULL,
  comment text NOT NULL,
  UNIQUE(club_id, user_id)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  club_id uuid REFERENCES clubs ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  date timestamptz NOT NULL,
  status text NOT NULL,
  payment_status text NOT NULL,
  amount integer NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create function to calculate average rating
CREATE OR REPLACE FUNCTION calculate_average_rating(club_id_param uuid)
RETURNS float AS $$
DECLARE
  avg_rating float;
BEGIN
  SELECT AVG(rating)::float INTO avg_rating
  FROM reviews
  WHERE club_id = club_id_param;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Profiles Policies
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Clubs Policies
CREATE POLICY "Anyone can view approved clubs"
  ON clubs
  FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Club owners can view their own clubs"
  ON clubs
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can view all clubs"
  ON clubs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Club owners can insert their own clubs"
  ON clubs
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Club owners can update their own clubs"
  ON clubs
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can update any club"
  ON clubs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Reviews Policies
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Bookings Policies
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Club owners can view bookings for their clubs"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = bookings.club_id AND clubs.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Club owners can update bookings for their clubs"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = bookings.club_id AND clubs.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);