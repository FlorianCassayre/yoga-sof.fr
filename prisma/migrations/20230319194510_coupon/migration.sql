-- CreateTable
CREATE TABLE `coupon_model` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_type` ENUM('YOGA_ADULT', 'YOGA_CHILD', 'YOGA_ADULT_CHILD') NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `course_type` ENUM('YOGA_ADULT', 'YOGA_CHILD', 'YOGA_ADULT_CHILD') NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,
    `disabled` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `coupon_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `coupon` ADD CONSTRAINT `coupon_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
