# CalSync - Modern Calendar Booking Application

A beautiful, responsive calendar booking application built with modern web technologies. CalSync allows users to manage event types, track bookings, and handle availability scheduling with an elegant user interface.

![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-06B6D4?logo=tailwindcss)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)

## 🌐 Live Demo

**[👉 View Live Project](https://tanstack-start-app.cal-clone-champ.workers.dev)**

Try the app now! Create events, manage bookings, and explore the beautiful responsive interface.

## ✨ Features

- **Event Type Management** - Create and manage different event types with custom settings
- **Booking Tracker** - View and manage all scheduled bookings in one place
- **Availability Management** - Set your availability calendar and time slots
- **Public Booking Page** - Shareable booking links for customers to book appointments
- **Responsive Design** - Fully responsive on mobile, tablet, and desktop
- **Modern UI/UX** - Beautiful glassmorphism design with smooth animations
- **Real-time Updates** - Live data synchronization with Supabase backend
- **Authentication** - Secure user authentication and session management

## 📌 Complete Booking Flow

CalSync provides a polished end-to-end booking experience for users and customers.

1. **📅 Choose a date**
   - A calendar interface lets users pick the desired appointment day.
2. **⏰ Select an available time slot**
   - The app displays available booking slots based on configured availability.
3. **🧾 Fill out the booking form**
   - Customers submit their **name** and **email** to reserve the slot.
4. **✅ Confirmation page**
   - After booking, customers see a confirmation screen with booking details and next steps.

This flow ensures visitors can quickly book appointments through the public booking page with a clean, guided experience.

## 🏗️ Tech Stack

### Frontend
- **React 19.2** - UI library
- **TypeScript** - Type-safe development
- **TanStack Start** - Full-stack React framework
- **TanStack Router** - Type-safe routing
- **TailwindCSS 4.2** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **shadcn/ui** - High-quality UI components
- **Lucide React** - Beautiful icons

### Backend & Database
- **Supabase** - PostgreSQL database + authentication
- **Supabase RLS** - Row-level security for data protection

### Build & Deployment
- **Vite 7.3** - Lightning-fast dev server and build tool
- **Cloudflare Workers** - Edge computing serverless platform
- **Wrangler** - Cloudflare Workers CLI

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or Bun package manager
- A Supabase account (https://supabase.com)
- A Cloudflare account (for deployment)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cal-clone-champ.git
cd cal-clone-champ
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

### 4. Set Up Supabase

1. Go to your Supabase project
2. Run the migrations in `supabase/migrations/` folder
3. Configure Row-Level Security (RLS) policies for data protection

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Building

Create a production build:

```bash
npm run build
```

This generates:
- `dist/client/` - Client-side assets
- `dist/server/` - Server-side code for Cloudflare Workers

## 🌐 Deployment

### Deploy to Cloudflare Workers

1. Install Wrangler CLI:

```bash
npm install -g @cloudflare/wrangler
```

2. Set environment variables in `wrangler.jsonc`:

```jsonc
"env": {
  "production": {
    "vars": {
      "VITE_SUPABASE_URL": "your_supabase_url",
      "VITE_SUPABASE_PUBLISHABLE_KEY": "your_publishable_key",
      "VITE_SUPABASE_PROJECT_ID": "your_project_id"
    }
  }
}
```

3. Deploy:

```bash
npm run build
npx wrangler deploy --env production
```

Your app will be live at: `https://tanstack-start-app.cal-clone-champ.workers.dev`

## 📁 Project Structure

```
src/
├── components/
│   ├── AppShell.tsx           # Main layout with navigation
│   ├── EventTypesPage.tsx     # Event management
│   ├── BookingsPage.tsx       # Booking list and tracking
│   ├── AvailabilityPage.tsx   # Availability calendar
│   ├── PublicBookingPage.tsx  # Public booking interface
│   └── ui/                    # shadcn/ui components
├── routes/
│   ├── __root.tsx             # Root layout
│   ├── index.tsx              # Home page
│   ├── event-types.tsx        # Event types route
│   ├── bookings.tsx           # Bookings route
│   ├── availability.tsx       # Availability route
│   └── book.$slug.tsx         # Public booking route
├── hooks/
│   └── use-mobile.tsx         # Mobile detection hook
├── integrations/
│   └── supabase/              # Supabase client config
├── lib/
│   ├── queries.ts             # Database queries
│   └── utils.ts               # Utility functions
└── styles/
    └── css/                   # Global styles

supabase/
├── migrations/                # Database migrations
└── config.toml               # Supabase config

public/                        # Static assets
```

## 🎨 UI Customization

### Colors & Theming

The app uses a gradient color scheme defined in components:
- Primary: Blue to Purple gradients
- Secondary: Slate colors
- Accents: Yellow for highlights

Customize Tailwind colors in `tailwind.config.ts`

### Responsive Breakpoints

- Mobile: default (< 640px)
- Tablet: `sm:` (640px - 768px)
- Desktop: `md:` (768px and above)
- Large: `lg:` (1024px and above)

## 🔐 Security

- **RLS Policies** - Row-level security enabled on all tables
- **Environment Variables** - Sensitive data stored securely
- **Type Safety** - TypeScript prevents runtime errors
- **SPA Security** - No sensitive data exposed in client code

## 📱 Mobile Responsiveness

The app is fully responsive with:
- Adaptive navigation (hamburger menu on mobile)
- Responsive typography and spacing
- Touch-friendly button sizes
- Mobile-optimized forms and inputs
- Automatic menu closing on viewport changes

## 🧪 Testing

Run tests:

```bash
npm run test
```

## 📚 Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For support, email support@calsync.dev or open an issue on GitHub.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [TanStack](https://tanstack.com) - Routing and data fetching
- [Supabase](https://supabase.com) - Backend service
- [Cloudflare Workers](https://workers.cloudflare.com) - Deployment platform

---

Made with ❤️ by the CalSync team
