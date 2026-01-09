# MachineIQ - CNC Training Platform

AI-powered CNC training platform for students, instructors, and advanced manufacturing teams.

## 🚀 Features

- **User Authentication**: Secure authentication with Supabase
- **Course Management**: Browse and filter courses by type (Mill, Lathe, 3D Milling, Multi-Axis)
- **Payment Integration**: Stripe subscription management ($99/month per seat)
- **Progress Tracking**: Track learning progress and course completion
- **Responsive Design**: Modern, mobile-first UI built with Tailwind CSS

## 📋 Prerequisites

- Node.js 20+ and npm 10+
- Supabase account
- Stripe account

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── health/       # Health check endpoint
│   │   ├── create-checkout-session/  # Stripe checkout
│   │   └── webhooks/      # Stripe webhooks
│   ├── auth/              # Authentication pages
│   ├── lessons/           # Lessons/courses page
│   └── payment/           # Payment pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   ├── lessons/          # Lesson components
│   ├── payment/          # Payment components
│   └── ui/               # Reusable UI components
└── lib/                  # Utility functions and configurations
    ├── actions/          # Server actions
    └── supabase/         # Supabase client configurations
```

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🔐 Authentication

The application uses Supabase for authentication. Users can:
- Sign up with email and password
- Sign in with existing credentials
- Reset forgotten passwords
- Automatic account creation prevention (checks for existing users)

## 💳 Payment Integration

Stripe is integrated for subscription management:
- Monthly subscription: $99/seat
- Secure checkout process
- Webhook handling for subscription events

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed Stripe configuration.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Language**: TypeScript

## 🔒 Security

- Environment variables for sensitive data
- Secure headers configured in Next.js
- Server-side authentication checks
- Webhook signature verification
- Input validation and sanitization

## 📝 Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Strict TypeScript configuration

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 📚 Documentation

- [Stripe Setup Guide](./STRIPE_SETUP.md)

## 📄 License

ISC
