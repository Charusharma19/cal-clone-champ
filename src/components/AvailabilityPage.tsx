import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  getDefaultSchedule,
  getAvailabilityRules,
  updateAvailabilityRule,
  updateScheduleTimezone,
  type AvailabilitySchedule,
  type AvailabilityRule,
} from "@/lib/queries";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const WEEKDAYS = [1, 2, 3, 4, 5];
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

function formatTime12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function AvailabilityPage() {
  const [schedule, setSchedule] = useState<AvailabilitySchedule | null>(null);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const s = await getDefaultSchedule();
      setSchedule(s);
      const r = await getAvailabilityRules(s.id);
      setRules(r);
    } catch {
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleDay = async (rule: AvailabilityRule) => {
    try {
      await updateAvailabilityRule(rule.id, { is_enabled: !rule.is_enabled });
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleTimeChange = async (rule: AvailabilityRule, field: "start_time" | "end_time", value: string) => {
    try {
      await updateAvailabilityRule(rule.id, { [field]: value });
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleTimezoneChange = async (tz: string) => {
    if (!schedule) return;
    try {
      await updateScheduleTimezone(schedule.id, tz);
      setSchedule((s) => (s ? { ...s, timezone: tz } : null));
      toast.success("Timezone updated");
    } catch {
      toast.error("Failed to update timezone");
    }
  };

  const handleSetWeekdays = async () => {
    try {
      await Promise.all(
        rules.map((rule) =>
          updateAvailabilityRule(rule.id, {
            is_enabled: WEEKDAYS.includes(rule.day_of_week),
          })
        )
      );
      load();
      toast.success("Business days enabled (Mon–Fri)");
    } catch {
      toast.error("Failed to update weekdays");
    }
  };

  const handleSetBusinessHours = async () => {
    try {
      await Promise.all(
        rules.map((rule) =>
          updateAvailabilityRule(rule.id, {
            start_time: "09:00",
            end_time: "17:00",
            is_enabled: WEEKDAYS.includes(rule.day_of_week),
          })
        )
      );
      load();
      toast.success("Business hours set to 9 AM – 5 PM for weekdays");
    } catch {
      toast.error("Failed to apply business hours");
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Availability</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure times when you are available for bookings.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Timezone */}
        <Card className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Timezone</Label>
                <p className="text-xs text-muted-foreground">Keep your schedule aligned with your local meeting zone.</p>
              </div>
            </div>
            <Select value={schedule?.timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Quick availability presets</h2>
              <p className="text-xs text-muted-foreground">Enable business days and apply a standard 9 AM–5 PM schedule.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={handleSetWeekdays}>
                Enable Mon–Fri
              </Button>
              <Button variant="secondary" onClick={handleSetBusinessHours}>
                Set 9 AM – 5 PM
              </Button>
            </div>
          </div>
        </Card>

        {/* Weekly hours */}
        <Card className="divide-y divide-border p-0">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-4 px-4 py-3">
              <Switch checked={rule.is_enabled} onCheckedChange={() => handleToggleDay(rule)} />
              <span
                className={`w-24 text-sm font-medium ${
                  rule.is_enabled ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {DAYS[rule.day_of_week]}
              </span>
              {rule.is_enabled ? (
                <div className="flex items-center gap-2">
                  <Select value={rule.start_time.slice(0, 5)} onValueChange={(v) => handleTimeChange(rule, "start_time", v)}>
                    <SelectTrigger className="w-28 text-xs">
                      <SelectValue>{formatTime12(rule.start_time)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {formatTime12(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">–</span>
                  <Select value={rule.end_time.slice(0, 5)} onValueChange={(v) => handleTimeChange(rule, "end_time", v)}>
                    <SelectTrigger className="w-28 text-xs">
                      <SelectValue>{formatTime12(rule.end_time)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {formatTime12(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Unavailable</span>
              )}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
