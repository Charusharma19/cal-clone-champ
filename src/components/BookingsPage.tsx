import { useState, useEffect } from "react";
import { Calendar, Clock, Mail, User, X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getBookings, cancelBooking, type Booking } from "@/lib/queries";
import { format, isPast } from "date-fns";

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getBookings();
      setBookings(data as Booking[]);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
      load();
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && !isPast(new Date(b.end_time))
  );
  const past = bookings.filter(
    (b) => b.status !== "confirmed" || isPast(new Date(b.end_time))
  );

  const BookingCard = ({ booking, showCancel }: { booking: Booking; showCancel: boolean }) => (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: booking.event_types?.color || "#2563eb" }}
            />
            <h3 className="font-semibold text-foreground">
              {booking.event_types?.title || "Meeting"}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                booking.status === "confirmed"
                  ? "bg-success/10 text-success"
                  : booking.status === "cancelled"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {booking.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(booking.start_time), "EEE, MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(booking.start_time), "h:mm a")} –{" "}
              {format(new Date(booking.end_time), "h:mm a")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {booking.booker_name}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {booking.booker_email}
            </span>
            {booking.event_types?.location && (
              <span className="flex items-center gap-1">
                <Video className="h-3.5 w-3.5" />
                {booking.event_types.location}
              </span>
            )}
          </div>
        </div>
        {showCancel && booking.status === "confirmed" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCancel(booking.id)}
            className="text-destructive hover:text-destructive"
          >
            <X className="mr-1 h-3 w-3" />
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See upcoming and past events booked through your event type links.
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming{upcoming.length > 0 && ` (${upcoming.length})`}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <Card className="flex flex-col items-center py-12">
              <Calendar className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No upcoming bookings</p>
            </Card>
          ) : (
            upcoming.map((b) => <BookingCard key={b.id} booking={b} showCancel />)
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0 ? (
            <Card className="flex flex-col items-center py-12">
              <Calendar className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No past bookings</p>
            </Card>
          ) : (
            past.map((b) => <BookingCard key={b.id} booking={b} showCancel={false} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
