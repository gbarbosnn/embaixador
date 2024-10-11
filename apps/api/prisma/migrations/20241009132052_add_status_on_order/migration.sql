/*
  Warnings:

  - You are about to drop the `Produto` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `status` to the `pedidos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "itens" DROP CONSTRAINT "itens_produtoId_fkey";

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "status" TEXT NOT NULL;

-- DropTable
DROP TABLE "Produto";

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "linha" TEXT NOT NULL,
    "precoDeMercado" DOUBLE PRECISION NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "imagem" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "produtos_sku_key" ON "produtos"("sku");

-- AddForeignKey
ALTER TABLE "itens" ADD CONSTRAINT "itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
