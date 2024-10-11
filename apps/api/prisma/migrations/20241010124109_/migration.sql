/*
  Warnings:

  - A unique constraint covering the columns `[blingId]` on the table `produtos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "blingId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "produtos_blingId_key" ON "produtos"("blingId");
