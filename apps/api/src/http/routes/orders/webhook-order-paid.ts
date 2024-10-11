import { createOrderOnBling } from "@/functions/bling/create-order";
import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const WebhookBody = z.object({
	data: z.object({
		code: z.string(),
	}),
});

type WebhookBodyType = z.infer<typeof WebhookBody>;

async function findProductById(idProduto: string) {
	return await prisma.produto.findFirst({
		where: { id: idProduto },
	});
}

export async function webhook(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post<{ Body: WebhookBodyType }>("/webhook/order-paid", async (request, reply) => {
		const { data } = request.body;
		const orderId = data.code;

		const order = await prisma.pedido.findFirst({ where: { id: orderId } });
		if (!order) {
			return reply.status(404).send({ message: "Pedido não encontrado." });
		}

		const items = await prisma.item.findMany({ where: { pedidoId: orderId } });
		if (items.length === 0) {
			return reply.status(400).send({ message: "Pedido não possui itens." });
		}

		const orderItems = await Promise.all(
			items.map(async (item) => {
				const product = await findProductById(item.produtoId);
				return {
					qtde: item.qtde,
					idProduto: product?.sku || '',
					preco: item.preco,
				};
			})
		);

		await prisma.pedido.update({
			where: { id: orderId },
			data: { status: "PAGO" },
		});

		if (orderItems.length === 0) {
			return reply.status(400).send({ message: "Pedido não possui itens válidos." });
		}

		await createOrderOnBling({
			cliente: {
				email: order.clienteEmail,
				nome: order.clienteNome,
				telefone: order.clienteTelefone,
			},
			enderecoEntrega: {
				bairro: order.enderecoEntregaBairro,
				cep: order.enderecoEntregaCep,
				cidade: order.enderecoEntregaCidade,
				complemento: order.enderecoEntregaComplemento || '',
				endereco: order.enderecoEntregaEndereco,
				estado: order.enderecoEntregaEstado,
				nomeRecebedor: order.enderecoEntregaNomeRecebedor,
				numero: order.enderecoEntregaNumero,
			},
			itens: orderItems as [{ qtde: number; preco: number; idProduto: string; }, ...{ qtde: number; preco: number; idProduto: string; }[]],
			pagamento: {
				metodo: order.pagamentoMetodo as "PIX" | "CREDITO",
				subtotal: order.pagamentoSubtotal,
				total: order.pagamentoTotal,
			},
		}, order.id);

		reply.status(200).send({ message: "Pedido atualizado com sucesso." });
	});
}
