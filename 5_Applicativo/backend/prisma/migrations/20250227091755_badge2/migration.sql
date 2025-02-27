/*
  Warnings:

  - You are about to drop the column `token` on the `badge_link` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[otp]` on the table `badge_link` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[badge]` on the table `badge_link` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `badge` to the `badge_link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otp` to the `badge_link` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `badge_link_token_key` ON `badge_link`;

-- AlterTable
ALTER TABLE `badge_link` DROP COLUMN `token`,
    ADD COLUMN `badge` VARCHAR(191) NOT NULL,
    ADD COLUMN `otp` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `badge_link_otp_key` ON `badge_link`(`otp`);

-- CreateIndex
CREATE UNIQUE INDEX `badge_link_badge_key` ON `badge_link`(`badge`);
