-- CreateEnum
CREATE TYPE "Role" AS ENUM ('member', 'admin');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('kahvalti', 'ogle', 'aksam', 'atistirmalik');

-- CreateEnum
CREATE TYPE "FoodSource" AS ENUM ('openfoodfacts', 'usda', 'manual');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "category" TEXT,
    "primary_muscle" TEXT,
    "secondary_muscles" TEXT[],
    "equipment" TEXT,
    "image_url" TEXT,
    "wger_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "weight_kg" DECIMAL(6,2) NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "performed_at" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "brand" TEXT,
    "unit" TEXT NOT NULL,
    "kcal_per_unit" DECIMAL(8,2) NOT NULL,
    "protein_g" DECIMAL(8,2) NOT NULL,
    "carbs_g" DECIMAL(8,2) NOT NULL,
    "fat_g" DECIMAL(8,2) NOT NULL,
    "source" "FoodSource" NOT NULL DEFAULT 'manual',
    "external_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "food_item_id" TEXT NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "quantity" DECIMAL(8,2) NOT NULL,
    "kcal" DECIMAL(8,2) NOT NULL,
    "protein_g" DECIMAL(8,2) NOT NULL,
    "carbs_g" DECIMAL(8,2) NOT NULL,
    "fat_g" DECIMAL(8,2) NOT NULL,
    "logged_at" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kcal_goal" INTEGER NOT NULL DEFAULT 2600,
    "protein_goal" INTEGER NOT NULL DEFAULT 180,
    "carbs_goal" INTEGER NOT NULL DEFAULT 280,
    "fat_goal" INTEGER NOT NULL DEFAULT 80,
    "water_goal_glasses" INTEGER NOT NULL DEFAULT 8,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "glass_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_wger_id_key" ON "exercises"("wger_id");

-- CreateIndex
CREATE INDEX "exercises_primary_muscle_idx" ON "exercises"("primary_muscle");

-- CreateIndex
CREATE INDEX "exercises_name_idx" ON "exercises"("name");

-- CreateIndex
CREATE INDEX "exercise_entries_user_id_exercise_id_performed_at_idx" ON "exercise_entries"("user_id", "exercise_id", "performed_at");

-- CreateIndex
CREATE INDEX "exercise_entries_user_id_performed_at_idx" ON "exercise_entries"("user_id", "performed_at");

-- CreateIndex
CREATE INDEX "food_items_name_idx" ON "food_items"("name");

-- CreateIndex
CREATE UNIQUE INDEX "food_items_source_external_id_key" ON "food_items"("source", "external_id");

-- CreateIndex
CREATE INDEX "meal_entries_user_id_logged_at_idx" ON "meal_entries"("user_id", "logged_at");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_goals_user_id_key" ON "nutrition_goals"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "water_entries_user_id_date_key" ON "water_entries"("user_id", "date");

-- AddForeignKey
ALTER TABLE "exercise_entries" ADD CONSTRAINT "exercise_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_entries" ADD CONSTRAINT "exercise_entries_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_goals" ADD CONSTRAINT "nutrition_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_entries" ADD CONSTRAINT "water_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
