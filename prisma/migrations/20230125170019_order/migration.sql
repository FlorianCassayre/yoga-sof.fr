-- AlterTable
ALTER TABLE `course_registration` ADD COLUMN `price` INTEGER UNSIGNED;
UPDATE `course_registration` SET `price` = (SELECT `price` FROM `course` WHERE `course_registration`.`course_id` = `course`.`id`);
ALTER TABLE `course_registration` MODIFY COLUMN `price` INTEGER UNSIGNED NOT NULL;

-- CreateTable
CREATE TABLE `transaction_cash` (
    `order_id` INTEGER NOT NULL,
    `amount` INTEGER UNSIGNED NOT NULL,
    `date` DATE NOT NULL,

    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_hello_asso` (
    `order_id` INTEGER NOT NULL,

    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_coupon` (
    `order_id` INTEGER NOT NULL,
    `coupon_id` INTEGER NOT NULL,
    `amount` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_course_registration` (
    `order_id` INTEGER NOT NULL,
    `registration_id` INTEGER NOT NULL,

    UNIQUE INDEX `credit_course_registration_registration_id_key`(`registration_id`),
    PRIMARY KEY (`order_id`, `registration_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_offer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('TRIAL') NOT NULL,
    `user_id` INTEGER NOT NULL,
    `order_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER UNSIGNED NOT NULL,
    `refunded` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_order_course_registration` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_order_course_registration_AB_unique`(`A`, `B`),
    INDEX `_order_course_registration_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_order_coupon` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_order_coupon_AB_unique`(`A`, `B`),
    INDEX `_order_coupon_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_order_membership` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_order_membership_AB_unique`(`A`, `B`),
    INDEX `_order_membership_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaction_cash` ADD CONSTRAINT `transaction_cash_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_hello_asso` ADD CONSTRAINT `transaction_hello_asso_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_coupon` ADD CONSTRAINT `credit_coupon_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_coupon` ADD CONSTRAINT `credit_coupon_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_course_registration` ADD CONSTRAINT `credit_course_registration_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_course_registration` ADD CONSTRAINT `credit_course_registration_registration_id_fkey` FOREIGN KEY (`registration_id`) REFERENCES `course_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_offer` ADD CONSTRAINT `credit_offer_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_offer` ADD CONSTRAINT `credit_offer_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_course_registration` ADD CONSTRAINT `_order_course_registration_A_fkey` FOREIGN KEY (`A`) REFERENCES `course_registration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_course_registration` ADD CONSTRAINT `_order_course_registration_B_fkey` FOREIGN KEY (`B`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_coupon` ADD CONSTRAINT `_order_coupon_A_fkey` FOREIGN KEY (`A`) REFERENCES `coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_coupon` ADD CONSTRAINT `_order_coupon_B_fkey` FOREIGN KEY (`B`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_membership` ADD CONSTRAINT `_order_membership_A_fkey` FOREIGN KEY (`A`) REFERENCES `membership`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_order_membership` ADD CONSTRAINT `_order_membership_B_fkey` FOREIGN KEY (`B`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
