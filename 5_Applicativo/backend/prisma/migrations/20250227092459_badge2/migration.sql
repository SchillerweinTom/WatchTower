-- DropIndex
DROP INDEX `badge_link_badge_key` ON `badge_link`;

-- AlterTable
ALTER TABLE `badge_link` MODIFY `badge` VARCHAR(191) NULL;
