/*
  Warnings:

  - You are about to drop the column `isStrategic` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "isStrategic";

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled';
