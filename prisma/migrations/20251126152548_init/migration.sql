-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ShoppingPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "MealStatus" AS ENUM ('PLANNED', 'DONE');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('GENERIC', 'BABY', 'HOUSE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BabyItemType" AS ENUM ('TASK', 'PURCHASE');

-- CreateEnum
CREATE TYPE "BabyItemStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "profile" TEXT,
    "color" TEXT,
    "householdId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" TEXT,
    "category" TEXT,
    "priority" "ShoppingPriority" NOT NULL DEFAULT 'MEDIUM',
    "isBought" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "boughtAt" TIMESTAMP(3),

    CONSTRAINT "ShoppingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanEntry" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "mealType" TEXT NOT NULL DEFAULT 'DINER',
    "label" TEXT NOT NULL,
    "status" "MealStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlanEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskType" NOT NULL DEFAULT 'GENERIC',
    "assignedToUserId" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTask" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "RecurringFrequency" NOT NULL,
    "interval" INTEGER,
    "assignedToUserId" TEXT,
    "lastOccurrenceAt" TIMESTAMP(3),
    "nextOccurrenceAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BabyChecklistItem" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "itemType" "BabyItemType" NOT NULL,
    "relatedTaskId" TEXT,
    "relatedShoppingItemId" TEXT,
    "status" "BabyItemStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BabyChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MealPlanEntry_householdId_date_idx" ON "MealPlanEntry"("householdId", "date");

-- CreateIndex
CREATE INDEX "Task_householdId_dueDate_idx" ON "Task"("householdId", "dueDate");

-- CreateIndex
CREATE INDEX "RecurringTask_householdId_nextOccurrenceAt_idx" ON "RecurringTask"("householdId", "nextOccurrenceAt");

-- CreateIndex
CREATE INDEX "BabyChecklistItem_householdId_section_idx" ON "BabyChecklistItem"("householdId", "section");

-- CreateIndex
CREATE INDEX "BabyChecklistItem_householdId_dueDate_idx" ON "BabyChecklistItem"("householdId", "dueDate");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanEntry" ADD CONSTRAINT "MealPlanEntry_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTask" ADD CONSTRAINT "RecurringTask_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTask" ADD CONSTRAINT "RecurringTask_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BabyChecklistItem" ADD CONSTRAINT "BabyChecklistItem_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BabyChecklistItem" ADD CONSTRAINT "BabyChecklistItem_relatedTaskId_fkey" FOREIGN KEY ("relatedTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BabyChecklistItem" ADD CONSTRAINT "BabyChecklistItem_relatedShoppingItemId_fkey" FOREIGN KEY ("relatedShoppingItemId") REFERENCES "ShoppingItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
