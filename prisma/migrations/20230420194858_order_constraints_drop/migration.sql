-- These were manually entered because Prisma did not detect the dropping of `@unique` constraints in the previous migration

ALTER TABLE `order_purchased_coupon_course_registration` DROP FOREIGN KEY `order_purchased_coupon_course_registration_course_registrat_fkey`;
ALTER TABLE `order_purchased_coupon_course_registration` DROP INDEX `order_purchased_coupon_course_registration_course_registrati_key`;
ALTER TABLE `order_purchased_coupon_course_registration` ADD CONSTRAINT `order_purchased_coupon_course_registration_course_registrat_fkey` FOREIGN KEY (`course_registration_id`) REFERENCES `course_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `order_trial_course_registration` DROP FOREIGN KEY `order_trial_course_registration_course_registration_id_fkey`;
ALTER TABLE `order_trial_course_registration` DROP INDEX `order_trial_course_registration_course_registration_id_key`;
ALTER TABLE `order_trial_course_registration` ADD CONSTRAINT `order_trial_course_registration_course_registration_id_fkey` FOREIGN KEY (`course_registration_id`) REFERENCES `course_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `order_replacement_course_registration` DROP FOREIGN KEY `order_replacement_course_registration_from_course_registrat_fkey`;
ALTER TABLE `order_replacement_course_registration` DROP INDEX `order_replacement_course_registration_from_course_registrati_key`;
ALTER TABLE `order_replacement_course_registration` ADD CONSTRAINT `order_replacement_course_registration_from_course_registrat_fkey` FOREIGN KEY (`from_course_registration_id`) REFERENCES `course_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `order_replacement_course_registration` DROP FOREIGN KEY `order_replacement_course_registration_to_course_registratio_fkey`;
ALTER TABLE `order_replacement_course_registration` DROP INDEX `order_replacement_course_registration_to_course_registration_key`;
ALTER TABLE `order_replacement_course_registration` ADD CONSTRAINT `order_replacement_course_registration_to_course_registratio_fkey` FOREIGN KEY (`to_course_registration_id`) REFERENCES `course_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
