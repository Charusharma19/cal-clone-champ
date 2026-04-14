import { Link, useLocation } from "@tanstack/react-router";
import { Calendar, Clock, Link2, Settings } from "lucide-react";

const navItems = [
  { to: "/event-types", label: "Event Types", icon: Link2 },
  { to: "/bookings", label: "Bookings", icon: Calendar },
  { to: "/availability", label: "Availability", icon: Clock },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Calendar className="h-6 w-6 text-foreground" />
          <span className="text-lg font-bold text-foreground tracking-tight">Cal.clone</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              U
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">Default User</p>
              <p className="truncate text-xs text-muted-foreground">user@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 md:hidden">
          <Calendar className="h-5 w-5 text-foreground" />
          <span className="font-bold text-foreground">Cal.clone</span>
          <nav className="ml-auto flex gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-md p-2 ${isActive ? "bg-secondary" : "hover:bg-secondary"}`}
                >
                  <item.icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
