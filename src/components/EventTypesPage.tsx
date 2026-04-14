import { useState, useEffect } from "react";
import { Plus, Copy, ExternalLink, Pencil, Trash2, Clock, Video } from "lucide-react";
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
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
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
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Event Types</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create events to share for people to book on your calendar.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : eventTypes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">No event types yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first event type to get started.</p>
          <Button onClick={openCreate} className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> New Event Type
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {eventTypes.map((et) => (
            <Card
              key={et.id}
              className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md"
            >
              <div
                className="h-full w-1.5 self-stretch rounded-full"
                style={{ backgroundColor: et.color || "#2563eb" }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{et.title}</h3>
                  {!et.is_active && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      Disabled
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {et.duration_minutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    {et.location}
                  </span>
                  <span className="text-xs">/book/{et.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Switch
                  checked={et.is_active}
                  onCheckedChange={() => handleToggle(et)}
                />
                <Button variant="ghost" size="icon" onClick={() => copyLink(et.slug)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <a href={`/book/${et.slug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
                <Button variant="ghost" size="icon" onClick={() => openEdit(et)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(et.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Event Type" : "New Event Type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
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
                placeholder="Quick Chat"
              />
            </div>
            <div>
              <Label>URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/book/</span>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="quick-chat"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="A brief description..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration_minutes: parseInt(e.target.value) || 15 }))
                  }
                  min={5}
                  step={5}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Google Meet"
                />
              </div>
            </div>
            <div>
              <Label>Color</Label>
              <div className="mt-2 flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${
                      form.color === c ? "scale-110 border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing ? "Save Changes" : "Create Event Type"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
