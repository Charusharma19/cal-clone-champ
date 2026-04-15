import { Link, useLocation } from "@tanstack/react-router";
import { Calendar, Clock, Link2, Settings, Sparkles, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/event-types", label: "Event Types", icon: Link2 },
  { to: "/bookings", label: "Bookings", icon: Calendar },
  { to: "/availability", label: "Availability", icon: Clock },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when resizing to desktop view
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        // Desktop view (md and above), close mobile menu
        setMobileMenuOpen(false);
      }
    };
    
    // Check immediately on mount
    if (mediaQuery.matches) {
      setMobileMenuOpen(false);
    }
    
    // Listen for changes
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="hidden w-64 flex-shrink-0 border-r border-border/50 bg-white/80 backdrop-blur-xl md:flex md:flex-col shadow-xl"
      >
        <div className="flex h-16 items-center gap-3 border-b border-border/50 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Calendar className="h-7 w-7 text-white" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300" />
          </motion.div>
          <span className="text-lg font-bold text-white tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            CalSync
          </span>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link
                  to={item.to}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-600 hover:bg-white/60 hover:text-slate-900 hover:shadow-md"
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.div>
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto h-2 w-2 rounded-full bg-white"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>
        <div className="border-t border-border/50 p-4 bg-gradient-to-r from-slate-50 to-blue-50">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20"
          >
            <motion.div
              whileHover={{ rotate: 10 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-lg"
            >
              U
            </motion.div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">Default User</p>
              <p className="truncate text-xs text-slate-500">user@example.com</p>
            </div>
          </motion.div>
        </div>
      </motion.aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <motion.header
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex h-20 sm:h-16 items-center gap-3 sm:gap-4 border-b border-border/50 bg-white/80 backdrop-blur-xl px-3 sm:px-4 shadow-sm md:hidden"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-white/60 transition-all duration-200 md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="relative flex-shrink-0"
          >
            <Calendar className="h-7 w-7 sm:h-6 sm:w-6 text-blue-600" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400" />
          </motion.div>
          <span className="font-bold text-base sm:text-sm text-slate-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CalSync
          </span>
        </motion.header>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2 border-b border-border/50 bg-white/80 backdrop-blur-xl px-3 py-4 space-y-2 md:hidden"
            >
              {navItems.map((item, index) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                          : "text-slate-600 hover:bg-white/60 hover:text-slate-900 hover:shadow-md"
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <item.icon className="h-5 w-5" />
                      </motion.div>
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="mobileActiveIndicator"
                          className="ml-auto h-2 w-2 rounded-full bg-white"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
