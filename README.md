# Keepsake 3D Webapp

A modern e-commerce platform for custom 3D printed keychains built with Next.js 15, React 19, Supabase, and Stripe.

## Tech Stack

- **Framework**: Next.js 15.1.8 (App Router)
- **React**: React 19
- **Database & Auth**: Supabase
- **Payments**: Stripe
- **Styling**: Tailwind CSS + shadcn/ui

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see `.env.example`)

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
ADMIN_EMAIL=
```

