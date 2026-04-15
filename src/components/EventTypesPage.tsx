import { useState, useEffect } from "react";
import { Plus, Copy, ExternalLink, Pencil, Trash2, Clock, Video, Sparkles, Calendar, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
  type EventType,
} from "@/lib/queries";

const COLORS = ["#2563eb", "#8b5cf6", "#f97316", "#10b981", "#ef4444", "#ec4899"];

export function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration_minutes: 30,
    slug: "",
    location: "Google Meet",
    color: "#2563eb",
  });

  const load = async () => {
    try {
      const data = await getEventTypes();
      setEventTypes(data);
    } catch {
      toast.error("Failed to load event types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", duration_minutes: 30, slug: "", location: "Google Meet", color: "#2563eb" });
    setDialogOpen(true);
  };

  const openEdit = (et: EventType) => {
    setEditing(et);
    setForm({
      title: et.title,
      description: et.description || "",
      duration_minutes: et.duration_minutes,
      slug: et.slug,
      location: et.location || "Google Meet",
      color: et.color || "#2563eb",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast.error("Title and URL slug are required");
      return;
    }
    try {
      if (editing) {
        await updateEventType(editing.id, form);
        toast.success("Event type updated");
      } else {
        await createEventType(form);
        toast.success("Event type created");
      }
      setDialogOpen(false);
      load();
    } catch (e: unknown) {
      const error = e as { message?: string };
      toast.error(error.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEventType(id);
      toast.success("Event type deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleToggle = async (et: EventType) => {
    try {
      await updateEventType(et.id, { is_active: !et.is_active });
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const autoSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0"
      >
        <div className="flex-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
          >
            Event Types
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-2 text-sm sm:text-base text-slate-600"
          >
            Create and manage your booking events with style and ease.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full sm:w-auto"
        >
          <Button
            onClick={openCreate}
            className="w-full sm:w-auto gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 py-3 sm:py-2 text-base sm:text-sm"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="h-5 w-5" />
            </motion.div>
            <span>Create Event</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{eventTypes.length}</p>
              <p className="text-sm text-blue-700">Total Events</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {eventTypes.filter(et => et.is_active).length}
              </p>
              <p className="text-sm text-green-700">Active Events</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {eventTypes.reduce((acc, et) => acc + et.duration_minutes, 0)}m
              </p>
              <p className="text-sm text-purple-700">Total Duration</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="h-24 animate-pulse rounded-xl bg-gradient-to-r from-slate-200 to-slate-300"
              />
            ))}
          </motion.div>
        ) : eventTypes.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 border-dashed border-2 border-slate-300">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6 p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
              >
                <Calendar className="h-12 w-12 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No event types yet</h3>
              <p className="text-slate-600 text-center mb-6 max-w-md">
                Create your first event type to start accepting bookings. It's quick and easy!
              </p>
              <Button
                onClick={openCreate}
                className="gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
                Create Your First Event
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="events"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {eventTypes.map((et, index) => (
              <motion.div
                key={et.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.01 }}
                className="group"
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center gap-4 p-6">
                    <motion.div
                      className="h-full w-2 self-stretch rounded-full shadow-sm"
                      style={{ backgroundColor: et.color || "#2563eb" }}
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {et.title}
                        </h3>
                        {!et.is_active && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            Disabled
                          </motion.span>
                        )}
                      </div>
                      {et.description && (
                        <p className="text-slate-600 mb-3 text-sm">{et.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {et.duration_minutes} minutes
                        </span>
                        <span className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          {et.location}
                        </span>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                          /book/{et.slug}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Switch
                          checked={et.is_active}
                          onCheckedChange={() => handleToggle(et)}
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyLink(et.slug)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <a href={`/book/${et.slug}`} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-green-50 hover:text-green-600"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(et)}
                          className="hover:bg-purple-50 hover:text-purple-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(et.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editing ? "Edit Event Type" : "Create New Event"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="text-slate-700 font-semibold">Event Title</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title,
                    slug: editing ? f.slug : autoSlug(title),
                  }));
                }}
                placeholder="e.g., Quick Chat, Team Meeting"
                className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="text-slate-700 font-semibold">URL Slug</Label>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded">/book/</span>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="quick-chat"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-700 font-semibold">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of what this meeting is about..."
                rows={3}
                className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-700 font-semibold">Duration</Label>
                <Input
                  type="number"
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration_minutes: parseInt(e.target.value) || 15 }))
                  }
                  min={5}
                  step={5}
                  className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label className="text-slate-700 font-semibold">Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Google Meet, Zoom, etc."
                  className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-700 font-semibold">Color Theme</Label>
              <div className="mt-3 flex gap-3">
                {COLORS.map((c) => (
                  <motion.button
                    key={c}
                    className={`h-10 w-10 rounded-xl border-4 transition-all duration-200 ${
                      form.color === c
                        ? "scale-110 border-slate-400 shadow-lg"
                        : "border-slate-200 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </div>
            <Button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold py-3"
            >
              {editing ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
