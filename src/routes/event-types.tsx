import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EventTypesPage } from "@/components/EventTypesPage";

export const Route = createFileRoute("/event-types")({
  head: () => ({
    meta: [
      { title: "Event Types — Cal.clone" },
      { name: "description", content: "Manage your event types and booking links" },
    ],
  }),
  component: () => (
    <AppShell>
      <EventTypesPage />
    </AppShell>
  ),
});
