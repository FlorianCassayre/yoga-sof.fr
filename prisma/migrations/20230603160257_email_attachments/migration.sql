-- CreateTable
CREATE TABLE `email_message_attachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email_message_id` INTEGER NOT NULL,
    `filename` TEXT NOT NULL,
    `file` LONGBLOB NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `email_message_attachment` ADD CONSTRAINT `email_message_attachment_email_message_id_fkey` FOREIGN KEY (`email_message_id`) REFERENCES `email_message`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
