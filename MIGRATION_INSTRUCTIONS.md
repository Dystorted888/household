# Database Migration Required

## Issue
The application has been updated to support assignment for baby items, but the database migration needs to be run manually.

## Migration SQL
Run the following SQL on your production database:

```sql
-- AlterTable
ALTER TABLE "BabyChecklistItem" ADD COLUMN "assignedToUserId" TEXT;

-- AddForeignKey
ALTER TABLE "BabyChecklistItem" ADD CONSTRAINT "BabyChecklistItem_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

## How to Run

### Option 1: Using Prisma Studio (Recommended)
1. Set your `DATABASE_URL` environment variable to your production database
2. Run: `npx prisma migrate deploy`

### Option 2: Direct SQL
1. Connect to your production database (via Vercel dashboard, Supabase, or your database provider)
2. Execute the SQL commands above

### Option 3: Using Vercel CLI
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

## After Migration
Once the migration is complete, restart your Vercel deployment or wait for the next deployment. The application should work normally.

## Note
Until this migration is run, the dashboard may show errors. The migration adds a nullable column, so it's safe to run and won't affect existing data.

