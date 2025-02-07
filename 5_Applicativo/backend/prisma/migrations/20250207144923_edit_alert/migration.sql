/*
  Warnings:

  - A unique constraint covering the columns `[user]` on the table `alert_setting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `alert_setting_user_key` ON `alert_setting`(`user`);
