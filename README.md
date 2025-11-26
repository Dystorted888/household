# Household & Baby Preparation Webapp

A comprehensive household management app built with Next.js, TypeScript, Prisma, and PostgreSQL. Manage meal planning, shopping lists, tasks, and baby preparation all in one place.

## Features

- **Meal Planning**: Weekly meal planner with inline editing and shopping list integration
- **Shopping Lists**: Organize shopping by lists with priorities and categories
- **Tasks**: Both one-time and recurring household tasks with assignments
- **Baby Preparation**: Comprehensive checklist with progress tracking
- **Dashboard**: Unified view of today's activities and weekly overview
- **Minimal Auth**: Simple Husband/Wife role-based access

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel

## Local Development Setup

### Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd household
npm install
```

### 2. Start Local PostgreSQL

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Or install PostgreSQL locally and create a database called 'household'
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/household?schema=public"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. First Time Setup

1. Visit the app - you'll be redirected to `/login`
2. Select either "Husband" or "Wife" to log in
3. The database will be seeded with default users and sample data

## Database Schema

The app uses the following main models:

- **Household**: Shared household data
- **User**: Household members (Husband/Wife)
- **MealPlanEntry**: Weekly meal planning
- **ShoppingList & ShoppingItem**: Shopping management
- **Task & RecurringTask**: Household chores
- **BabyChecklistItem**: Baby preparation tracking

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Database
npm run prisma:migrate  # Run database migrations
npm run prisma:generate # Generate Prisma client
npm run prisma:seed     # Seed database with sample data

# Code Quality
npm run lint        # Run ESLint
```

## Vercel Deployment

### 1. Database Setup

For production, use a managed PostgreSQL service:

- **Vercel Postgres** (recommended): Free tier available
- **Neon**: Serverless PostgreSQL
- **Supabase**: Open source Firebase alternative

### 2. Environment Variables

In your Vercel project settings, add:

```env
DATABASE_URL="your-production-database-url"
```

### 3. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

### 4. Database Migration

After deployment, run migrations on your production database:

```bash
# Connect to your production database
npx prisma db push

# Or run migrations if you prefer
npx prisma migrate deploy
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── login/             # Authentication
│   ├── meals/             # Meal planning module
│   ├── shopping/          # Shopping lists module
│   ├── tasks/             # Tasks module
│   ├── baby/              # Baby preparation module
│   └── settings/          # User settings
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   ├── meals/            # Meal planning components
│   └── ...
├── context/              # React contexts (auth)
├── lib/                  # Utility functions
│   ├── prisma.ts         # Database client
│   ├── dates.ts          # Date utilities
│   ├── dashboard.ts      # Dashboard data aggregation
│   └── ...
└── types/                # TypeScript type definitions
```

## Architecture Notes

- **Server Components**: Used for data fetching and initial page loads
- **Client Components**: Used for interactive features (forms, state management)
- **API Routes**: RESTful endpoints for CRUD operations
- **Prisma**: Type-safe database access with automatic migrations
- **Minimal Auth**: Simple localStorage-based user switching (no passwords needed for household use)

## Contributing

1. Follow the existing code style and component patterns
2. Use TypeScript for all new code
3. Test database changes locally before committing
4. Keep components modular and reusable

## License

This project is private and intended for personal/household use.