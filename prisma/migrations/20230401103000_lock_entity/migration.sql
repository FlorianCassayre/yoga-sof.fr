-- CreateTable
CREATE TABLE `lock_entity` (
    `id` ENUM('GLOBAL') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `lock_entity` (`id`) VALUES ('GLOBAL');
