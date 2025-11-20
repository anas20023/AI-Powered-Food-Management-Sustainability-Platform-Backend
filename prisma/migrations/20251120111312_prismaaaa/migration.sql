-- CreateTable
CREATE TABLE `aiprediction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `upload_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `payload` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `aiprediction_upload_id_idx`(`upload_id`),
    INDEX `aiprediction_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fooditem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('Snacks', 'Vegetable', 'Meat', 'Dairy', 'Drinks', 'Fast_Food') NOT NULL,
    `expiration_days` INTEGER NULL,
    `cost_per_unit` INTEGER NULL,
    `unit` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fooditem_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `food_item_id` INTEGER NULL,
    `status` ENUM('Available', 'Expired', 'Consumed') NOT NULL DEFAULT 'Available',
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `unit` VARCHAR(191) NULL,
    `purchased_date` DATETIME(3) NULL,
    `expiry_date` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `inventory_food_item_id_idx`(`food_item_id`),
    INDEX `inventory_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `log_title` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `food_item_id` INTEGER NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `category` ENUM('Snacks', 'Vegetable', 'Meat', 'Dairy', 'Drinks', 'Fast_Food') NULL,
    `logged_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `log_food_item_id_idx`(`food_item_id`),
    INDEX `log_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `related_category` ENUM('Waste_Reduction', 'Budget_Tips', 'Dietary_Tips', 'Meal_Planning', 'Storage_Tips') NULL,
    `type` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `upload` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NULL,
    `associated_inventory_id` INTEGER NULL,
    `associated_log_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `upload_associated_inventory_id_idx`(`associated_inventory_id`),
    INDEX `upload_associated_log_id_idx`(`associated_log_id`),
    INDEX `upload_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UploadFoodItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uploadId` INTEGER NOT NULL,
    `foodItemId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UploadFoodItem_uploadId_idx`(`uploadId`),
    INDEX `UploadFoodItem_foodItemId_idx`(`foodItemId`),
    UNIQUE INDEX `UploadFoodItem_uploadId_foodItemId_key`(`uploadId`, `foodItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` ENUM('Individual', 'Family', 'Community') NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `household_size` INTEGER NULL,
    `dietary_preferences` JSON NULL,
    `budget_range` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `aiprediction` ADD CONSTRAINT `aiprediction_upload_id_fkey` FOREIGN KEY (`upload_id`) REFERENCES `upload`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aiprediction` ADD CONSTRAINT `aiprediction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fooditem` ADD CONSTRAINT `fooditem_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_food_item_id_fkey` FOREIGN KEY (`food_item_id`) REFERENCES `fooditem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log` ADD CONSTRAINT `log_food_item_id_fkey` FOREIGN KEY (`food_item_id`) REFERENCES `fooditem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log` ADD CONSTRAINT `log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `upload` ADD CONSTRAINT `upload_associated_inventory_id_fkey` FOREIGN KEY (`associated_inventory_id`) REFERENCES `inventory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `upload` ADD CONSTRAINT `upload_associated_log_id_fkey` FOREIGN KEY (`associated_log_id`) REFERENCES `log`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `upload` ADD CONSTRAINT `upload_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UploadFoodItem` ADD CONSTRAINT `UploadFoodItem_uploadId_fkey` FOREIGN KEY (`uploadId`) REFERENCES `upload`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UploadFoodItem` ADD CONSTRAINT `UploadFoodItem_foodItemId_fkey` FOREIGN KEY (`foodItemId`) REFERENCES `fooditem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
