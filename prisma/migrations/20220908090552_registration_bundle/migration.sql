-- /!\ This migration assumes that no bundles have been created yet

UPDATE `course` SET `bundle_id` = NULL;
ALTER TABLE `course` DROP FOREIGN KEY `course_bundle_id_fkey`;
TRUNCATE TABLE `course_bundle`;

ALTER TABLE `course_bundle` ADD COLUMN `slots` INTEGER UNSIGNED NOT NULL,
    ADD COLUMN `type` ENUM('YOGA_ADULT', 'YOGA_CHILD', 'YOGA_ADULT_CHILD') NOT NULL,
    MODIFY `name` VARCHAR(191) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `tmp_course_id` INTEGER NOT NULL;

INSERT INTO `course_bundle` (`name`, `type`, `price`, `slots`, `created_at`, `updated_at`, `tmp_course_id`)
    SELECT NULL, `type`, `price`, `slots`, `created_at`, `updated_at`, `id` FROM `course`;

UPDATE `course` c SET c.`bundle_id` = (SELECT b.`id` FROM `course_bundle` b WHERE b.`tmp_course_id` = c.`id`);

ALTER TABLE `course_bundle` DROP COLUMN `tmp_course_id`;

ALTER TABLE `course`
    DROP COLUMN `price`,
    DROP COLUMN `slots`,
    DROP COLUMN `type`,
    MODIFY `bundle_id` INTEGER NOT NULL,
    ADD COLUMN `canceled_at` DATETIME(3);

UPDATE `course` SET `canceled_at` = `updated_at` WHERE `is_canceled`;


-- DropForeignKey
ALTER TABLE `course_registration` DROP FOREIGN KEY `course_registration_course_id_fkey`;

ALTER TABLE `course_registration` RENAME TO `course_bundle_registration`;
ALTER TABLE `course_bundle_registration` ADD COLUMN `course_bundle_id` INTEGER;
UPDATE `course_bundle_registration` r SET r.`course_bundle_id` = (SELECT c.`bundle_id` FROM `course` c WHERE c.`id` = r.`course_id`);
ALTER TABLE `course_bundle_registration` MODIFY COLUMN `course_bundle_id` INTEGER NOT NULL;
ALTER TABLE `course_bundle_registration` ADD CONSTRAINT `course_bundle_registration_course_bundle_id_fkey` FOREIGN KEY (`course_bundle_id`) REFERENCES `course_bundle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE `course_observed_attendance` (
    `course_id` INTEGER NOT NULL,
    `course_bundle_registration_id` INTEGER NOT NULL,
    `attended` BOOLEAN NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`course_id`, `course_bundle_registration_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_declared_absence` (
    `course_id` INTEGER NOT NULL,
    `course_bundle_registration_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`course_id`, `course_bundle_registration_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_reminder_sent` (
    `course_id` INTEGER NOT NULL,
    `course_bundle_registration_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`course_id`, `course_bundle_registration_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_bundle_id_fkey` FOREIGN KEY (`bundle_id`) REFERENCES `course_bundle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_observed_attendance` ADD CONSTRAINT `course_observed_attendance_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_observed_attendance` ADD CONSTRAINT `course_observed_attendance_course_bundle_registration_id_fkey` FOREIGN KEY (`course_bundle_registration_id`) REFERENCES `course_bundle_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_declared_absence` ADD CONSTRAINT `course_declared_absence_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_declared_absence` ADD CONSTRAINT `course_declared_absence_course_bundle_registration_id_fkey` FOREIGN KEY (`course_bundle_registration_id`) REFERENCES `course_bundle_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_reminder_sent` ADD CONSTRAINT `course_reminder_sent_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_reminder_sent` ADD CONSTRAINT `course_reminder_sent_course_bundle_registration_id_fkey` FOREIGN KEY (`course_bundle_registration_id`) REFERENCES `course_bundle_registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;


INSERT INTO `course_observed_attendance` (`course_id`, `course_bundle_registration_id`, `attended`, `updated_at`)
    SELECT `course_id`, `id`, `attended`, CURRENT_TIMESTAMP(3) FROM `course_bundle_registration` WHERE `attended` IS NOT NULL;

INSERT INTO `course_reminder_sent` (`course_id`, `course_bundle_registration_id`)
    SELECT `course_id`, `id` FROM `course_bundle_registration` WHERE `reminder_sent`;

ALTER TABLE `course_bundle_registration`
    DROP COLUMN `course_id`,
    DROP COLUMN `attended`,
    DROP COLUMN `reminder_sent`;

-- Checks

ALTER TABLE `course_model`
    ADD CONSTRAINT `weekday_check` CHECK (`weekday` < 7),
    ADD CONSTRAINT `time_start_check` CHECK (`time_start` RLIKE '^([0-1]\\d|2[0-3]):[0-5]\\d$'),
    ADD CONSTRAINT `time_end_check` CHECK (`time_end` RLIKE '^([0-1]\\d|2[0-3]):[0-5]\\d$');

ALTER TABLE `course`
    ADD CONSTRAINT `cancelation_check` CHECK ((`is_canceled` OR (`cancelation_reason` IS NULL)) AND (`is_canceled` = (`canceled_at` IS NOT NULL)));

ALTER TABLE `course_bundle_registration`
    ADD CONSTRAINT `user_cancelation_check` CHECK (`is_user_canceled` = (`canceled_at` IS NOT NULL));
