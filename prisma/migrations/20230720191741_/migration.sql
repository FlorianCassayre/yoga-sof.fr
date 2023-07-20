/*
  Warnings:

  - You are about to drop the `admin_whitelist` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('ADMINISTRATOR', 'MANAGER', 'ASSOCIATE', 'MEMBER') NOT NULL DEFAULT 'MEMBER';

-- DropTable
DROP TABLE `admin_whitelist`;
