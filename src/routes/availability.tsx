import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AvailabilityPage } from "@/components/AvailabilityPage";

export const Route = createFileRoute("/availability")({
  head: () => ({
    meta: [
      { title: "Availability — Cal.clone" },
      { name: "description", content: "Set your availability schedule" },
    ],
  }),
  component: () => (
    <AppShell>
      <AvailabilityPage />
    </AppShell>
  ),
});
