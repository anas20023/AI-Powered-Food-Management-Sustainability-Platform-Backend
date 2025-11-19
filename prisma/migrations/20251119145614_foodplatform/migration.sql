-- CreateTable
CREATE TABLE `User` (
    `id` CHAR(36) NOT NULL,
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

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodItem` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('Snacks', 'Vegitabe', 'Meat', 'Dairy', 'Drinks', 'Fast_Food') NOT NULL,
    `expiration_days` INTEGER NULL,
    `cost_per_unit` DECIMAL(10, 2) NULL,
    `unit` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `food_item_id` CHAR(36) NULL,
    `status` ENUM('Available', 'Expired', 'Consumed') NOT NULL DEFAULT 'Available',
    `quantity` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    `unit` VARCHAR(191) NULL,
    `purchased_date` DATE NULL,
    `expiry_date` DATE NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `id` CHAR(36) NOT NULL,
    `log_title` VARCHAR(191) NULL,
    `user_id` CHAR(36) NOT NULL,
    `food_item_id` CHAR(36) NULL,
    `quantity` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    `category` ENUM('Snacks', 'Vegitabe', 'Meat', 'Dairy', 'Drinks', 'Fast_Food') NULL,
    `logged_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resource` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `related_category` ENUM('Waste_Reduction', 'Budget_Tips', 'Dietary_Tips', 'Meal_Planning', 'Storage_Tips') NULL,
    `type` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Upload` (
    `id` CHAR(36) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `associated_inventory_id` CHAR(36) NULL,
    `associated_log_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AiPrediction` (
    `id` CHAR(36) NOT NULL,
    `upload_id` CHAR(36) NULL,
    `user_id` CHAR(36) NULL,
    `payload` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_food_item_id_fkey` FOREIGN KEY (`food_item_id`) REFERENCES `FoodItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_food_item_id_fkey` FOREIGN KEY (`food_item_id`) REFERENCES `FoodItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Upload` ADD CONSTRAINT `Upload_associated_inventory_id_fkey` FOREIGN KEY (`associated_inventory_id`) REFERENCES `Inventory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Upload` ADD CONSTRAINT `Upload_associated_log_id_fkey` FOREIGN KEY (`associated_log_id`) REFERENCES `Log`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AiPrediction` ADD CONSTRAINT `AiPrediction_upload_id_fkey` FOREIGN KEY (`upload_id`) REFERENCES `Upload`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AiPrediction` ADD CONSTRAINT `AiPrediction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
