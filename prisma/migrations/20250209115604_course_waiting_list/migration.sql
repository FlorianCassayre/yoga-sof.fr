-- AlterTable
ALTER TABLE `email_message` MODIFY `type` ENUM('SESSION_CANCELED', 'SESSION_REMINDER_NEWCOMER', 'SESSION_REGISTRATION', 'ORDER_CREATED', 'COURSE_WAITING_LIST', 'OTHER') NOT NULL;

-- CreateTable
CREATE TABLE `course_waiting_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `course_id` INTEGER NOT NULL,
    `is_user_canceled` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `canceled_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_waiting_list` ADD CONSTRAINT `course_waiting_list_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_waiting_list` ADD CONSTRAINT `course_waiting_list_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
