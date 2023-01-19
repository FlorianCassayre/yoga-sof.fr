-- CreateTable
CREATE TABLE `membership_model` (
    `id` ENUM('PERSON', 'FAMILY') NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membership` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('PERSON', 'FAMILY') NOT NULL,
    `date_start` DATE NOT NULL,
    `date_end` DATE NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,
    `disabled` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_user_membership` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_user_membership_AB_unique`(`A`, `B`),
    INDEX `_user_membership_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_user_membership` ADD CONSTRAINT `_user_membership_A_fkey` FOREIGN KEY (`A`) REFERENCES `membership`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_user_membership` ADD CONSTRAINT `_user_membership_B_fkey` FOREIGN KEY (`B`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
