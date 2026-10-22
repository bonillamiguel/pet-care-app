# Pet Care App 🐾

A mobile app for dog walking and pet care businesses: client bookings, walker schedules, visit report cards with photos, and billing, all in one place for owners, walkers, and clients.

> 🚧 In development. Login and user roles (owner / walker / client) are working. Pets, scheduling, report cards, and Stripe billing are next.

**Built with:** React Native (Expo) · TypeScript · Supabase (PostgreSQL, Auth, Storage) · Stripe

## Run it locally

```bash
git clone https://github.com/YOUR-USERNAME/pet-care-app.git
cd pet-care-app
npm install
```

Create a `.env.local` file with your Supabase project's keys:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Then run `npx expo start` and scan the QR code with Expo Go.

---

Built by **Miguel Bonilla**, CS student at Queens College (CUNY)
