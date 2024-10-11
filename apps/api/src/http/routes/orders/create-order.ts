import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { type Pedido, PedidoSchema } from "@/contracts/pedido";
import { createLink } from "@/functions/pagarme/create-order";

export async function createOrder(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post<{ Body: Pedido }>(
		"/orders",
		{
			schema: {
				body: PedidoSchema,
			},
		},
		async (request, reply) => {
			const pedido = request.body;

			try {
				const produtoIds = pedido.itens.map((item) => item.idProduto);
				const produtosExistentes = await prisma.produto.findMany({
					where: {
						id: { in: produtoIds },
					},
				});

				if (produtosExistentes.length !== produtoIds.length) {
					return reply.code(400).send({
						error: "Um ou mais produtos não existem no banco de dados.",
					});
				}

				const novoPedido = await prisma.pedido.create({
					data: {
						clienteEmail: pedido.cliente.email,
						clienteNome: pedido.cliente.nome,
						clienteTelefone: pedido.cliente.telefone,
						enderecoEntregaBairro: pedido.enderecoEntrega.bairro,
						enderecoEntregaCep: pedido.enderecoEntrega.cep,
						enderecoEntregaCidade: pedido.enderecoEntrega.cidade,
						enderecoEntregaComplemento:
						pedido.enderecoEntrega.complemento || "",
						enderecoEntregaEndereco: pedido.enderecoEntrega.endereco,
						enderecoEntregaEstado: pedido.enderecoEntrega.estado,
						enderecoEntregaNomeRecebedor: pedido.enderecoEntrega.nomeRecebedor,
						enderecoEntregaNumero: pedido.enderecoEntrega.numero,
						pagamentoMetodo: pedido.pagamento.metodo,
						pagamentoSubtotal: pedido.pagamento.subtotal,
						pagamentoTotal: pedido.pagamento.total,
						itens: {
							create: pedido.itens.map((item) => ({
								qtde: item.qtde,
								preco: item.preco,
								produto: {
									connect: {
										id: item.idProduto,
									},
								},
							})),
						},
						status:"PENDENTE"
					},
				});

				const linkResult = await createLink(
					pedido,
					novoPedido.id,
					pedido.pagamento.metodo,
				);

				if (!linkResult) {
					return reply
						.code(500)
						.send({ error: "Erro ao criar link de pagamento" });
				}

				const { payment_url } = linkResult;

				return reply.code(201).send({
					id: novoPedido.id,
					message: "Pedido criado com sucesso",
					payment_url,
				});
			} catch (error) {
				console.error("Erro ao criar pedido:", error);
				return reply.code(500).send({ error: "Erro ao criar pedido" });
			}
		},
	);
}
