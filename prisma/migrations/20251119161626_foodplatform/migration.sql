-- CreateTable
CREATE TABLE `aiprediction` (
    `id` CHAR(36) NOT NULL,
    `upload_id` CHAR(36) NULL,
    `user_id` CHAR(36) NULL,
    `payload` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AiPrediction_upload_id_fkey`(`upload_id`),
    INDEX `AiPrediction_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fooditem` (
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
CREATE TABLE `inventory` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `food_item_id` CHAR(36) NULL,
    `status` ENUM('Available', 'Expired', 'Consumed') NOT NULL DEFAULT 'Available',
    `quantity` DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    `unit` VARCHAR(191) NULL,
    `purchased_date` DATE NULL,
    `expiry_date` DATE NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Inventory_food_item_id_fkey`(`food_item_id`),
    INDEX `Inventory_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log` (
    `id` CHAR(36) NOT NULL,
    `log_title` VARCHAR(191) NULL,
    `user_id` CHAR(36) NOT NULL,
    `food_item_id` CHAR(36) NULL,
    `quantity` DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    `category` ENUM('Snacks', 'Vegitabe', 'Meat', 'Dairy', 'Drinks', 'Fast_Food') NULL,
    `logged_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Log_food_item_id_fkey`(`food_item_id`),
    INDEX `Log_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource` (
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
CREATE TABLE `upload` (
    `id` CHAR(36) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `associated_inventory_id` CHAR(36) NULL,
    `associated_log_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Upload_associated_inventory_id_fkey`(`associated_inventory_id`),
    INDEX `Upload_associated_log_id_fkey`(`associated_log_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
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
