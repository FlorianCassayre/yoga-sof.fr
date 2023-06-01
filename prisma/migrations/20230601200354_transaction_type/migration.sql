-- AlterTable
ALTER TABLE `order_payment` MODIFY `type` ENUM('CASH', 'HELLO_ASSO', 'CHECK', 'TRANSFER') NOT NULL;

-- AlterTable
ALTER TABLE `transaction` MODIFY `type` ENUM('CASH', 'HELLO_ASSO', 'CHECK', 'TRANSFER') NOT NULL;
