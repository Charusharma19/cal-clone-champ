import { useState, useEffect } from "react";
import { Calendar, Clock, Mail, User, X, Video, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <motion.div
                  className="h-4 w-4 rounded-full shadow-sm"
                  style={{ backgroundColor: booking.event_types?.color || "#2563eb" }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                />
                <h3 className="text-lg font-bold text-slate-900">
                  {booking.event_types?.title || "Meeting"}
                </h3>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : booking.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {booking.status}
                </motion.span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  {format(new Date(booking.start_time), "EEE, MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  {format(new Date(booking.start_time), "h:mm a")} –{" "}
                  {format(new Date(booking.end_time), "h:mm a")}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-500" />
                  {booking.booker_name}
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-500" />
                  {booking.booker_email}
                </span>
                {booking.event_types?.location && (
                  <span className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-indigo-500" />
                    {booking.event_types.location}
                  </span>
                )}
              </div>
            </div>
            {showCancel && booking.status === "confirmed" && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(booking.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
        >
          Bookings
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-2 text-slate-600"
        >
          Manage your scheduled meetings and appointments.
        </motion.p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{upcoming.length}</p>
              <p className="text-sm text-green-700">Upcoming</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{past.length}</p>
              <p className="text-sm text-blue-700">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {Math.round((past.length / Math.max(bookings.length, 1)) * 100)}%
              </p>
              <p className="text-sm text-purple-700">Completion Rate</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <Tabs defaultValue="upcoming">
        <TabsList className="bg-white/80 backdrop-blur-sm border shadow-sm">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Upcoming{upcoming.length > 0 && ` (${upcoming.length})`}
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-slate-500 data-[state=active]:text-white">
            Past
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="h-32 animate-pulse rounded-xl bg-gradient-to-r from-slate-200 to-slate-300"
                />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 border-dashed border-2 border-slate-300">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-6 p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
                >
                  <Calendar className="h-12 w-12 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No upcoming bookings</h3>
                <p className="text-slate-600 text-center max-w-md">
                  Your scheduled meetings will appear here. Share your event links to start receiving bookings!
                </p>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((b) => <BookingCard key={b.id} booking={b} showCancel />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          {past.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-slate-50 to-slate-50 border-dashed border-2 border-slate-300">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="mb-6 p-4 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full"
                >
                  <CheckCircle className="h-12 w-12 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No past bookings</h3>
                <p className="text-slate-600 text-center max-w-md">
                  Completed meetings will be shown here once they occur.
                </p>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {past.map((b) => <BookingCard key={b.id} booking={b} showCancel={false} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
