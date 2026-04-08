-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raffles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'cosmic',
    "animation_style" TEXT NOT NULL DEFAULT 'slot_machine',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raffles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "raffle_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_drawn" BOOLEAN NOT NULL DEFAULT false,
    "drawn_at" TIMESTAMP(3),
    "draw_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "raffles_name_key" ON "raffles"("name");

-- CreateIndex
CREATE INDEX "participants_raffle_id_is_drawn_idx" ON "participants"("raffle_id", "is_drawn");

-- CreateIndex
CREATE UNIQUE INDEX "participants_raffle_id_name_key" ON "participants"("raffle_id", "name");

-- AddForeignKey
ALTER TABLE "raffles" ADD CONSTRAINT "raffles_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
