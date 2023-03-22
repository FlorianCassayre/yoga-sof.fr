/*
  Warnings:

  - A unique constraint covering the columns `[order_id]` on the table `transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `order_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `order_purchased_coupon_course_registration` (
    `order_id` INTEGER NOT NULL,
    `coupon_id` INTEGER NOT NULL,
    `course_registration_id` INTEGER NOT NULL,

    UNIQUE INDEX `order_purchased_coupon_course_registration_course_registrati_key`(`course_registration_id`),
    PRIMARY KEY (`order_id`, `coupon_id`, `course_registration_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_trial_course_registration` (
    `order_id` INTEGER NOT NULL,
    `course_registration_id` INTEGER NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `order_trial_course_registration_course_registration_id_key`(`course_registration_id`),
    PRIMARY KEY (`order_id`, `course_registration_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_replacement_course_registration` (
    `order_id` INTEGER NOT NULL,
    `from_course_registration_id` INTEGER NOT NULL,
    `to_course_registration_id` INTEGER NOT NULL,

    UNIQUE INDEX `order_replacement_course_registration_from_course_registrati_key`(`from_course_registration_id`),
    UNIQUE INDEX `order_replacement_course_registration_to_course_registration_key`(`to_course_registration_id`),
    PRIMARY KEY (`order_id`, `from_course_registration_id`, `to_course_registration_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_payment` (
    `order_id` INTEGER NOT NULL,
    `amount` INTEGER UNSIGNED NOT NULL,
    `type` ENUM('CASH', 'HELLO_ASSO') NOT NULL,

    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `date` DATE NOT NULL,
    `notes` TEXT NULL,
    `computed_amount` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_order_purchased_course_registration` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_order_purchased_course_registration_AB_unique`(`A`, `B`),
    INDEX `_order_purchased_course_registration_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_order_purchased_coupon` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_order_purchased_coupon_AB_unique`(`A`, `B`),
    INDEX `_order_purchased_coupon_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_order_purchased_membership` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_order_purchased_membership_AB_unique`(`A`, `B`),
    INDEX `_order_purchased_membership_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `transaction_order_id_key` ON `transaction`(`order_id`);

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_purchased_coupon_course_registration` ADD CONSTRAINT `order_purchased_coupon_course_registration_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_purchased_coupon_course_registration` ADD CONSTRAINT `order_purchased_coupon_course_registration_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_purchased_coupon_course_registration` ADD CONSTRAINT `order_purchased_coupon_course_registration_course_registrat_fkey` FOREIGN KEY (`course_registration_id`) REFERENCES `course_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_trial_course_registration` ADD CONSTRAINT `order_trial_course_registration_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_trial_course_registration` ADD CONSTRAINT `order_trial_course_registration_course_registration_id_fkey` FOREIGN KEY (`course_registration_id`) REFERENCES `course_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_replacement_course_registration` ADD CONSTRAINT `order_replacement_course_registration_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_replacement_course_registration` ADD CONSTRAINT `order_replacement_course_registration_from_course_registrat_fkey` FOREIGN KEY (`from_course_registration_id`) REFERENCES `course_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_replacement_course_registration` ADD CONSTRAINT `order_replacement_course_registration_to_course_registratio_fkey` FOREIGN KEY (`to_course_registration_id`) REFERENCES `course_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_payment` ADD CONSTRAINT `order_payment_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_purchased_course_registration` ADD CONSTRAINT `_order_purchased_course_registration_A_fkey` FOREIGN KEY (`A`) REFERENCES `course_registration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_purchased_course_registration` ADD CONSTRAINT `_order_purchased_course_registration_B_fkey` FOREIGN KEY (`B`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_purchased_coupon` ADD CONSTRAINT `_order_purchased_coupon_A_fkey` FOREIGN KEY (`A`) REFERENCES `coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_purchased_coupon` ADD CONSTRAINT `_order_purchased_coupon_B_fkey` FOREIGN KEY (`B`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_purchased_membership` ADD CONSTRAINT `_order_purchased_membership_A_fkey` FOREIGN KEY (`A`) REFERENCES `membership`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_purchased_membership` ADD CONSTRAINT `_order_purchased_membership_B_fkey` FOREIGN KEY (`B`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
