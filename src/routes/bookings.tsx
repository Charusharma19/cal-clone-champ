import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BookingsPage } from "@/components/BookingsPage";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — Cal.clone" },
      { name: "description", content: "View and manage your bookings" },
    ],
  }),
  component: () => (
    <AppShell>
      <BookingsPage />
    </AppShell>
  ),
});
