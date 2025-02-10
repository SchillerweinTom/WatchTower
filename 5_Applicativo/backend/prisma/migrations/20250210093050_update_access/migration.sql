/*
  Warnings:

  - Added the required column `authorized` to the `access` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `access` ADD COLUMN `authorized` BOOLEAN NOT NULL;
