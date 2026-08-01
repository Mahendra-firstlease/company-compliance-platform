/*
  Warnings:

  - You are about to drop the column `categoryId` on the `service` table. All the data in the column will be lost.
  - You are about to drop the `servicecategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_categoryId_fkey`;

-- DropIndex
DROP INDEX `Service_categoryId_fkey` ON `service`;

-- AlterTable
ALTER TABLE `application` ADD COLUMN `formData` JSON NULL;

-- AlterTable
ALTER TABLE `service` DROP COLUMN `categoryId`;

-- DropTable
DROP TABLE `servicecategory`;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'INFO',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `activeCases` INTEGER NOT NULL DEFAULT 0,
    `completedCases` INTEGER NOT NULL DEFAULT 0,
    `slaRate` VARCHAR(191) NOT NULL DEFAULT '98.5%',
    `status` VARCHAR(191) NOT NULL DEFAULT 'AVAILABLE',
    `avatarUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TeamMember_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Application_serviceSlug_idx` ON `Application`(`serviceSlug`);

-- CreateIndex
CREATE INDEX `Application_status_idx` ON `Application`(`status`);

-- CreateIndex
CREATE INDEX `Application_createdAt_idx` ON `Application`(`createdAt`);

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `Application_userId_idx` ON `Application`(`userId`);
DROP INDEX `Application_userId_fkey` ON `application`;
