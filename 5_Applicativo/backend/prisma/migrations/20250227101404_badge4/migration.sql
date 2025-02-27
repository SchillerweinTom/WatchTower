/*
  Warnings:

  - A unique constraint covering the columns `[badge]` on the table `badge_link` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `badge_link` MODIFY `otp` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `badge_link_badge_key` ON `badge_link`(`badge`);
