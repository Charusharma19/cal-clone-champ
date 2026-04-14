
-- Default user ID for the assumed logged-in user
-- We'll use a fixed UUID as the "default user"

-- Event Types
CREATE TABLE public.event_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  slug TEXT NOT NULL UNIQUE,
  location TEXT DEFAULT 'Google Meet',
  is_active BOOLEAN NOT NULL DEFAULT true,
  color TEXT DEFAULT '#2563eb',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Availability Schedules
CREATE TABLE public.availability_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Working Hours',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Availability Rules (per day of week)
CREATE TABLE public.availability_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.availability_schedules(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Date Overrides
CREATE TABLE public.date_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.availability_schedules(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type_id UUID NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
  booker_name TEXT NOT NULL,
  booker_email TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Since no auth required, allow full public access
CREATE POLICY "Public read event_types" ON public.event_types FOR SELECT USING (true);
CREATE POLICY "Public insert event_types" ON public.event_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update event_types" ON public.event_types FOR UPDATE USING (true);
CREATE POLICY "Public delete event_types" ON public.event_types FOR DELETE USING (true);

CREATE POLICY "Public read availability_schedules" ON public.availability_schedules FOR SELECT USING (true);
CREATE POLICY "Public insert availability_schedules" ON public.availability_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update availability_schedules" ON public.availability_schedules FOR UPDATE USING (true);
CREATE POLICY "Public delete availability_schedules" ON public.availability_schedules FOR DELETE USING (true);

CREATE POLICY "Public read availability_rules" ON public.availability_rules FOR SELECT USING (true);
CREATE POLICY "Public insert availability_rules" ON public.availability_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update availability_rules" ON public.availability_rules FOR UPDATE USING (true);
CREATE POLICY "Public delete availability_rules" ON public.availability_rules FOR DELETE USING (true);

CREATE POLICY "Public read date_overrides" ON public.date_overrides FOR SELECT USING (true);
CREATE POLICY "Public insert date_overrides" ON public.date_overrides FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update date_overrides" ON public.date_overrides FOR UPDATE USING (true);
CREATE POLICY "Public delete date_overrides" ON public.date_overrides FOR DELETE USING (true);

CREATE POLICY "Public read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Public delete bookings" ON public.bookings FOR DELETE USING (true);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_event_types_updated_at BEFORE UPDATE ON public.event_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_availability_schedules_updated_at BEFORE UPDATE ON public.availability_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data: Event Types
INSERT INTO public.event_types (title, description, duration_minutes, slug, location, color) VALUES
  ('15 Minute Meeting', 'A quick 15-minute catch-up call.', 15, '15min', 'Google Meet', '#f97316'),
  ('30 Minute Meeting', 'A standard 30-minute meeting for discussions.', 30, '30min', 'Google Meet', '#2563eb'),
  ('60 Minute Meeting', 'An in-depth 60-minute meeting for detailed discussions.', 60, '60min', 'Zoom', '#8b5cf6');

-- Seed data: Default Availability Schedule
INSERT INTO public.availability_schedules (name, timezone, is_default) VALUES ('Working Hours', 'America/New_York', true);

-- Seed availability rules (Mon-Fri 9am-5pm)
INSERT INTO public.availability_rules (schedule_id, day_of_week, start_time, end_time, is_enabled)
SELECT s.id, d.day, '09:00'::TIME, '17:00'::TIME, CASE WHEN d.day IN (0, 6) THEN false ELSE true END
FROM public.availability_schedules s, (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(day)
WHERE s.is_default = true;

-- Seed bookings
INSERT INTO public.bookings (event_type_id, booker_name, booker_email, start_time, end_time, status)
SELECT et.id, 'Alice Johnson', 'alice@example.com', now() + interval '2 days' + interval '10 hours', now() + interval '2 days' + interval '10 hours 30 minutes', 'confirmed'
FROM public.event_types et WHERE et.slug = '30min';

INSERT INTO public.bookings (event_type_id, booker_name, booker_email, start_time, end_time, status)
SELECT et.id, 'Bob Smith', 'bob@example.com', now() + interval '3 days' + interval '14 hours', now() + interval '3 days' + interval '15 hours', 'confirmed'
FROM public.event_types et WHERE et.slug = '60min';

INSERT INTO public.bookings (event_type_id, booker_name, booker_email, start_time, end_time, status)
SELECT et.id, 'Carol Davis', 'carol@example.com', now() - interval '5 days' + interval '11 hours', now() - interval '5 days' + interval '11 hours 15 minutes', 'completed'
FROM public.event_types et WHERE et.slug = '15min';

-- Create index for faster booking lookups
CREATE INDEX idx_bookings_event_type ON public.bookings(event_type_id);
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_availability_rules_schedule ON public.availability_rules(schedule_id);
CREATE INDEX idx_event_types_slug ON public.event_types(slug);
