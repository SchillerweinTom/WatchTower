-- AlterTable
ALTER TABLE `alert` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `message` VARCHAR(191) NULL,
    ADD COLUMN `severity` ENUM('LOW', 'MEDIUM', 'HIGH') NULL;
