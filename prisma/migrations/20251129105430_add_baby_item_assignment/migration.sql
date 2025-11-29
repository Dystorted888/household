-- AlterTable
ALTER TABLE "BabyChecklistItem" ADD COLUMN "assignedToUserId" TEXT;

-- AddForeignKey
ALTER TABLE "BabyChecklistItem" ADD CONSTRAINT "BabyChecklistItem_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

