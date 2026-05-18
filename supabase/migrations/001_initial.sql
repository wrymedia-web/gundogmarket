-- GunDog Market — Initial Schema

-- Dog listings
CREATE TABLE dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  breed TEXT NOT NULL,
  age_months INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  training_level TEXT NOT NULL CHECK (training_level IN ('puppy', 'started', 'finished', 'brood')),
  price INTEGER NOT NULL, -- in cents
  location_state TEXT,
  location_city TEXT,
  description TEXT,
  health_certs JSONB DEFAULT '[]',
  hunt_titles JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  video_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'draft')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seller profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  location_state TEXT,
  location_city TEXT,
  bio TEXT,
  phone TEXT,
  verified BOOLEAN DEFAULT false,
  breeder_pro BOOLEAN DEFAULT false,
  kennel_name TEXT,
  website TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES profiles(id),
  dog_id UUID REFERENCES dogs(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dogs are viewable by everyone" ON dogs FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own dogs" ON dogs FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Reviews viewable by all" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
