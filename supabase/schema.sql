-- KTX Carpooling Database Schema (Section 15)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  student_id TEXT,
  university TEXT,
  dorm_area TEXT,
  dorm_building TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  dorm_card_verified TEXT DEFAULT 'PENDING' CHECK (dorm_card_verified IN ('PENDING', 'VERIFIED', 'REJECTED', 'NEED_REVIEW')),
  dorm_card_url TEXT,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  completed_trip_count INT DEFAULT 0,
  cancelled_trip_count INT DEFAULT 0,
  role TEXT DEFAULT 'BOTH' CHECK (role IN ('DRIVER', 'PASSENGER', 'BOTH', 'ADMIN')),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BLOCKED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  pickup_area TEXT NOT NULL,
  pickup_building TEXT NOT NULL,
  pickup_point TEXT NOT NULL,
  destination_university TEXT NOT NULL,
  destination_campus TEXT,
  destination_building TEXT,
  class_period INT,
  class_start_time TIME,
  available_seats INT DEFAULT 1,
  distance_km NUMERIC(5, 2) DEFAULT 0,
  suggested_price INT DEFAULT 5000,
  payment_method TEXT DEFAULT 'CASH' CHECK (payment_method IN ('CASH', 'BANK_TRANSFER')),
  notes TEXT,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REPORTED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trip Requests Table
CREATE TABLE IF NOT EXISTS public.trip_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  passenger_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  requested_pickup_time TIME NOT NULL,
  match_score INT DEFAULT 0,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ratings Table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES public.users(id) NOT NULL,
  to_user_id UUID REFERENCES public.users(id) NOT NULL,
  stars INT CHECK (stars BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Trip Reports Table
CREATE TABLE IF NOT EXISTS public.trip_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) NOT NULL,
  reporter_id UUID REFERENCES public.users(id) NOT NULL,
  reported_user_id UUID REFERENCES public.users(id) NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Messages Table (In-app Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
