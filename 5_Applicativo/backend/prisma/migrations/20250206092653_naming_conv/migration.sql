/*
  Warnings:

  - You are about to drop the `alert_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `alert_settings`;

-- CreateTable
CREATE TABLE `alert_setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user` VARCHAR(191) NOT NULL,
    `temp_limit` DOUBLE NOT NULL,
    `hum_limit` DOUBLE NOT NULL,
    `co2_limit` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
