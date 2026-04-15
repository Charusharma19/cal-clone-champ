import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  ArrowLeft,
  Video,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getEventTypeBySlug,
  getDefaultSchedule,
  getAvailabilityRules,
  getBookingsForEventType,
  getAvailableTimeSlotsForEventType,
  isBookingSlotAvailable,
  createBooking,
  type EventType,
  type AvailabilityRule,
} from "@/lib/queries";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isBefore, startOfDay, addDays } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type BookingStep = "select" | "form" | "confirmed";

export function PublicBookingPage({ slug }: { slug: string }) {
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [bookings, setBookings] = useState<Tables<"bookings">[]>([]);
  const [timezone, setTimezone] = useState("America/New_York");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<BookingStep>("select");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const et = await getEventTypeBySlug(slug);
        setEventType(et);
        const schedule = await getDefaultSchedule();
        setTimezone(schedule.timezone);
        const r = await getAvailabilityRules(schedule.id);
        setRules(r);
        const b = await getBookingsForEventType(et.id);
        setBookings(b);
      } catch {
        setError("Event type not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startDay = getDay(start);
    const padding = Array.from({ length: startDay }, (_, i) => null);
    return [...padding, ...days];
  }, [currentMonth]);

  const isDayAvailable = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return false;
    const dow = getDay(date);
    return rules.some((r) => r.day_of_week === dow && r.is_enabled);
  };

  useEffect(() => {
    if (!selectedDate || !eventType) {
      setTimeSlots([]);
      return;
    }

    let mounted = true;
    setSlotsLoading(true);

    getAvailableTimeSlotsForEventType(
      eventType.id,
      selectedDate,
      eventType.duration_minutes,
      timezone
    )
      .then((slots) => {
        if (!mounted) return;
        setTimeSlots(slots);
      })
      .catch(() => {
        if (!mounted) return;
        toast.error("Failed to load time slots");
        setTimeSlots([]);
      })
      .finally(() => {
        if (!mounted) return;
        setSlotsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedDate, eventType, timezone]);

  const handleBook = async () => {
    if (!eventType || !selectedDate || !selectedTime || !name || !email) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const [h, m] = selectedTime.split(":").map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(h, m, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + eventType.duration_minutes);

      const slotAvailable = await isBookingSlotAvailable(
        eventType.id,
        startTime.toISOString(),
        endTime.toISOString()
      );

      if (!slotAvailable) {
        toast.error("This slot is already booked. Please choose another time.");
        return;
      }

      const booking = await createBooking({
        event_type_id: eventType.id,
        booker_name: name,
        booker_email: email,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notes: notes || null,
      });
      setConfirmedBooking(booking);
      setStep("confirmed");
    } catch {
      toast.error("Failed to create booking. The slot may already be taken.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (error || !eventType) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30">
        <h1 className="text-2xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-muted-foreground">This event type doesn't exist.</p>
        <a href="/" className="mt-4 text-sm text-primary underline">Go home</a>
      </div>
    );
  }

  // Confirmation screen
  if (step === "confirmed" && confirmedBooking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Booking Confirmed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A calendar event has been added to your calendar.
          </p>
          <div className="mt-6 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(confirmedBooking.start_time), "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(confirmedBooking.start_time), "h:mm a")} –{" "}
                {format(new Date(confirmedBooking.end_time), "h:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Video className="h-4 w-4 text-muted-foreground" />
              <span>{eventType.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{timezone.replace(/_/g, " ")}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-4xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left panel - Event info */}
          <div className="w-full border-b border-border p-6 md:w-72 md:border-b-0 md:border-r">
            {step === "form" && (
              <button
                onClick={() => setStep("select")}
                className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </button>
            )}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              U
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Default User</p>
            <h1
              className="mt-1 text-xl font-bold"
              style={{ color: eventType.color || "#2563eb" }}
            >
              {eventType.title}
            </h1>
            {eventType.description && (
              <p className="mt-2 text-sm text-muted-foreground">{eventType.description}</p>
            )}
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{eventType.duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>{eventType.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{timezone.replace(/_/g, " ")}</span>
              </div>
              {selectedDate && selectedTime && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {format(selectedDate, "EEE, MMM d")} at {formatTime12(selectedTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right panel */}
          {step === "select" ? (
            <div className="flex flex-1 flex-col p-6 md:flex-row">
              {/* Calendar */}
              <div className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">
                    {format(currentMonth, "MMMM yyyy")}
                  </h2>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="py-1 font-medium">{d}</div>
                  ))}
                  {calendarDays.map((day, i) => {
                    if (!day) return <div key={`pad-${i}`} />;
                    const available = isDayAvailable(day);
                    const selected = selectedDate && isSameDay(day, selectedDate);
                    const today = isToday(day);
                    return (
                      <button
                        key={day.toISOString()}
                        disabled={!available}
                        onClick={() => {
                          setSelectedDate(day);
                          setSelectedTime(null);
                        }}
                        className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground"
                            : available
                            ? "font-medium text-foreground hover:bg-secondary"
                            : "text-muted-foreground/40 cursor-not-allowed"
                        } ${today && !selected ? "ring-1 ring-primary" : ""}`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="mt-4 w-full border-t border-border pt-4 md:ml-6 md:mt-0 md:w-48 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    {format(selectedDate, "EEE, MMM d")}
                  </h3>
                  <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {slotsLoading ? (
                      <p className="text-xs text-muted-foreground">Loading slots...</p>
                    ) : timeSlots.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No available times</p>
                    ) : (
                      timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => {
                            setSelectedTime(time);
                            setStep("form");
                          }}
                          className={`w-full rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                            selectedTime === time
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-foreground hover:border-primary"
                          }`}
                        >
                          {formatTime12(time)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Booking form */
            <div className="flex-1 p-6">
              <h2 className="mb-6 text-lg font-semibold text-foreground">Your Details</h2>
              <div className="space-y-4">
                <div>
                  <Label>Your Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Please share anything that will help prepare for our meeting."
                    rows={3}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleBook}
                  disabled={submitting || !name || !email}
                >
                  {submitting ? "Confirming..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function formatTime12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
