-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteEmail" TEXT NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "clienteTelefone" TEXT NOT NULL,
    "enderecoEntregaBairro" TEXT NOT NULL,
    "enderecoEntregaCep" TEXT NOT NULL,
    "enderecoEntregaCidade" TEXT NOT NULL,
    "enderecoEntregaComplemento" TEXT,
    "enderecoEntregaEndereco" TEXT NOT NULL,
    "enderecoEntregaEstado" TEXT NOT NULL,
    "enderecoEntregaNomeRecebedor" TEXT NOT NULL,
    "enderecoEntregaNumero" TEXT NOT NULL,
    "pagamentoMetodo" TEXT NOT NULL,
    "pagamentoSubtotal" DOUBLE PRECISION NOT NULL,
    "pagamentoTotal" DOUBLE PRECISION NOT NULL,
    "userId" TEXT,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens" (
    "id" TEXT NOT NULL,
    "qtde" INTEGER NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,

    CONSTRAINT "itens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens" ADD CONSTRAINT "itens_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens" ADD CONSTRAINT "itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
