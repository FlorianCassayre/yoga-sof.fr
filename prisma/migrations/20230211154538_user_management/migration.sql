-- AlterTable
ALTER TABLE `email_message` ADD COLUMN `cc_address` VARCHAR(191) NULL,
    MODIFY `destination_address` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `managed_by_user_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_managed_by_user_id_fkey` FOREIGN KEY (`managed_by_user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
