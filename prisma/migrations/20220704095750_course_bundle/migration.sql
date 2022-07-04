-- AlterTable
ALTER TABLE `course` ADD COLUMN `bundle_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `course_model` ADD COLUMN `bundle` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `course_model` ALTER `bundle` DROP DEFAULT;

-- CreateTable
CREATE TABLE `course_bundle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_bundle_id_fkey` FOREIGN KEY (`bundle_id`) REFERENCES `course_bundle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
