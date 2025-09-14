-- Create bathrooms table
CREATE TABLE IF NOT EXISTS bathrooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  building TEXT NOT NULL,
  distance INTEGER NOT NULL,
  rating REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  cleanliness TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  floor TEXT NOT NULL,
  facilities TEXT[] NOT NULL,
  accessibility BOOLEAN NOT NULL DEFAULT FALSE,
  paper_supply TEXT NOT NULL CHECK (paper_supply IN ('Bom', 'Médio', 'Fraco')),
  privacy TEXT NOT NULL CHECK (privacy IN ('Excelente', 'Boa', 'Média')),
  last_cleaned TEXT NOT NULL,
  has_accessible BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bathroom_id TEXT NOT NULL REFERENCES bathrooms(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  date DATE NOT NULL,
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  paper_supply INTEGER NOT NULL CHECK (paper_supply >= 1 AND paper_supply <= 5),
  privacy INTEGER NOT NULL CHECK (privacy >= 1 AND privacy <= 5),
  paper_available BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bathrooms_building ON bathrooms(building);
CREATE INDEX IF NOT EXISTS idx_bathrooms_floor ON bathrooms(floor);
CREATE INDEX IF NOT EXISTS idx_bathrooms_rating ON bathrooms(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_bathroom_id ON reviews(bathroom_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE bathrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on bathrooms" ON bathrooms
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on reviews" ON reviews
  FOR SELECT USING (true);

-- Create policies for inserting reviews (public can add reviews)
CREATE POLICY "Allow public insert on reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Create policies for updating bathrooms (only for admin/service role)
-- This would be restricted in production
CREATE POLICY "Allow public update on bathrooms" ON bathrooms
  FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_bathrooms_updated_at
  BEFORE UPDATE ON bathrooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();