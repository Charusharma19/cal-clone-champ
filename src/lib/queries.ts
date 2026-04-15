import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type EventType = Tables<"event_types">;
export type Booking = Tables<"bookings"> & { event_types?: EventType };
export type AvailabilitySchedule = Tables<"availability_schedules">;
export type AvailabilityRule = Tables<"availability_rules">;
export type DateOverride = Tables<"date_overrides">;

// Event Types
export async function getEventTypes() {
  const { data, error } = await supabase
    .from("event_types")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getEventTypeBySlug(slug: string) {
  const { data, error } = await supabase
    .from("event_types")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}

export async function createEventType(eventType: TablesInsert<"event_types">) {
  const { data, error } = await supabase
    .from("event_types")
    .insert(eventType)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEventType(id: string, updates: TablesUpdate<"event_types">) {
  const { data, error } = await supabase
    .from("event_types")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEventType(id: string) {
  const { error } = await supabase.from("event_types").delete().eq("id", id);
  if (error) throw error;
}

// Availability
export async function getDefaultSchedule() {
  const { data, error } = await supabase
    .from("availability_schedules")
    .select("*")
    .eq("is_default", true)
    .single();
  if (error) throw error;
  return data;
}

export async function getAvailabilityRules(scheduleId: string) {
  const { data, error } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("schedule_id", scheduleId)
    .order("day_of_week", { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateAvailabilityRule(id: string, updates: TablesUpdate<"availability_rules">) {
  const { data, error } = await supabase
    .from("availability_rules")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateScheduleTimezone(id: string, timezone: string) {
  const { data, error } = await supabase
    .from("availability_schedules")
    .update({ timezone })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Bookings
export async function getBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, event_types(*)")
    .order("start_time", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getBookingsForEventType(eventTypeId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("event_type_id", eventTypeId)
    .eq("status", "confirmed");
  if (error) throw error;
  return data;
}

export async function createBooking(booking: TablesInsert<"bookings">) {
  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select("*, event_types(*)")
    .single();
  if (error) throw error;
  return data;
}

export async function isBookingSlotAvailable(
  eventTypeId: string,
  startTime: string,
  endTime: string
) {
  const { data, error } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("event_type_id", eventTypeId)
    .eq("status", "confirmed");
  if (error) throw error;

  const requestedStart = new Date(startTime);
  const requestedEnd = new Date(endTime);

  return !data.some((booking) => {
    const bookingStart = new Date(booking.start_time);
    const bookingEnd = new Date(booking.end_time);
    return requestedStart < bookingEnd && requestedEnd > bookingStart;
  });
}

export async function cancelBooking(id: string) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAvailableTimeSlotsForEventType(
  eventTypeId: string,
  date: Date,
  durationMinutes: number,
  timezone?: string
) {
  const schedule = await getDefaultSchedule();
  const rules = await getAvailabilityRules(schedule.id);
  const bookings = await getBookingsForEventType(eventTypeId);
  return generateTimeSlots(
    date,
    rules,
    bookings,
    durationMinutes,
    timezone || schedule.timezone
  );
}

// Time slot generation
export function generateTimeSlots(
  date: Date,
  rules: AvailabilityRule[],
  existingBookings: Tables<"bookings">[],
  durationMinutes: number,
  timezone: string
): string[] {
  const dayOfWeek = date.getDay();
  const rule = rules.find((r) => r.day_of_week === dayOfWeek && r.is_enabled);
  if (!rule) return [];

  const slots: string[] = [];
  const [startH, startM] = rule.start_time.split(":").map(Number);
  const [endH, endM] = rule.end_time.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let m = startMinutes; m + durationMinutes <= endMinutes; m += 30) {
    const hour = Math.floor(m / 60);
    const min = m % 60;
    const slotStart = new Date(date);
    slotStart.setHours(hour, min, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

    // Check if slot conflicts with existing bookings
    const hasConflict = existingBookings.some((b) => {
      if (b.status === "cancelled") return false;
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      return slotStart < bEnd && slotEnd > bStart;
    });

    // Don't show past slots
    if (slotStart < new Date()) continue;

    if (!hasConflict) {
      slots.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }
  }

  return slots;
}
