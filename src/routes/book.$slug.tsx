import { createFileRoute } from "@tanstack/react-router";
import { PublicBookingPage } from "@/components/PublicBookingPage";

export const Route = createFileRoute("/book/$slug")({
  head: () => ({
    meta: [
      { title: "Book a Meeting — Cal.clone" },
      { name: "description", content: "Select a time to book your meeting" },
    ],
  }),
  component: () => {
    const { slug } = Route.useParams();
    return <PublicBookingPage slug={slug} />;
  },
});
