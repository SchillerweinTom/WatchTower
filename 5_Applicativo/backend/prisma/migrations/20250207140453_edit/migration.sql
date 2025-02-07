/*
  Warnings:

  - You are about to drop the column `co2_limit` on the `alert_setting` table. All the data in the column will be lost.
  - You are about to drop the column `hum_limit` on the `alert_setting` table. All the data in the column will be lost.
  - You are about to drop the column `temp_limit` on the `alert_setting` table. All the data in the column will be lost.
  - Added the required column `co2_limit_max` to the `alert_setting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hum_limit_max` to the `alert_setting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hum_limit_min` to the `alert_setting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `temp_limit_max` to the `alert_setting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `temp_limit_min` to the `alert_setting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `alert_setting` DROP COLUMN `co2_limit`,
    DROP COLUMN `hum_limit`,
    DROP COLUMN `temp_limit`,
    ADD COLUMN `co2_limit_max` DOUBLE NOT NULL,
    ADD COLUMN `hum_limit_max` DOUBLE NOT NULL,
    ADD COLUMN `hum_limit_min` DOUBLE NOT NULL,
    ADD COLUMN `temp_limit_max` DOUBLE NOT NULL,
    ADD COLUMN `temp_limit_min` DOUBLE NOT NULL;
