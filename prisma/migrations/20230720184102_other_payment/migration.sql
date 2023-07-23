-- AlterTable
ALTER TABLE `order_payment` MODIFY `type` ENUM('CASH', 'HELLO_ASSO', 'CHECK', 'TRANSFER', 'AUTOMATIC_DEBIT') NOT NULL;

-- AlterTable
ALTER TABLE `transaction` MODIFY `type` ENUM('CASH', 'HELLO_ASSO', 'CHECK', 'TRANSFER', 'AUTOMATIC_DEBIT') NOT NULL;

-- CreateTable
CREATE TABLE `other_payment_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `other_payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `amount_cents` INTEGER NOT NULL,
    `provider` TEXT NOT NULL,
    `recipient` ENUM('ORGANIZATION', 'ENTERPRISE') NOT NULL,
    `date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `other_payment` ADD CONSTRAINT `other_payment_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `other_payment_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
