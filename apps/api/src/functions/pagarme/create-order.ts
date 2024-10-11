import type { Pedido } from "@/contracts/pedido";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import axios from "axios";

interface itensPedido {
	amount: number;
	description: string;
	quantity: number;
	code: string;
}

export async function createLink(
	pedido: Pedido,
	idPedido: string,
	type: "PIX" | "CREDITO",
) {
	const { cliente, enderecoEntrega, itens, pagamento } = pedido;
	const url = `${env.PAGARME_API_URL}orders`;
	const username = env.PAGARME_API_USERNAME;

	const itensPedido: itensPedido[] = await Promise.all(
		itens.map(async (item) => {
			const product = await prisma.produto.findUnique({
				where: {
					id: item.idProduto,
				},
			});

			if (!product) {
				throw new Error(`Produto não encontrado: ${item.idProduto}`);
			}

			return {
				amount: item.preco * 100,
				description: product.nome,
				quantity: item.qtde,
				code: product.sku,
			};
		}),
	);

	const parcelas = pagamento.parcelas ?? 1;

	const dataCredito = {
		code: idPedido,
		items: itensPedido,
		customer: {
			name: cliente.nome,
			email: cliente.email,
			code: "idContato",
		},
		shipping: {
			address: {
				country: "BR",
				state: enderecoEntrega.estado,
				city: enderecoEntrega.cidade,
				zip_code: enderecoEntrega.cep,
				line_1: enderecoEntrega.endereco,
				line_2: enderecoEntrega.complemento,
			},
			amount: 0,
			description: "Embaixador",
			recipient_name: cliente.nome,
			recipient_phone: cliente.telefone,
		},
		payments: [
			{
				amount: (pagamento.total * 100).toFixed(0),
				payment_method: "checkout",
				checkout: {
					expires_in: 86400,
					billing_address_editable: false,
					customer_editable: true,
					accepted_payment_methods: ["credit_card"],
					success_url: "https://www.vinhosjolimont.com.br/",
					credit_card: {
					installments: Array.from({ length: parcelas }, (_, i) => ({
						number: i + 1,
						total: (pagamento.total * 100).toFixed(0),
					})),
					},
				},
			},
		],
	};

	const dataPix = {
		code: idPedido,
		items: itensPedido,
		customer: {
			name: cliente.nome,
			email: cliente.email,
			code: "idContato",
		},
		shipping: {
			address: {
				country: "BR",
				state: enderecoEntrega.estado,
				city: enderecoEntrega.cidade,
				zip_code: enderecoEntrega.cep,
				line_1: enderecoEntrega.endereco,
				line_2: enderecoEntrega.complemento,
			},
			amount: 0,
			description: "Embaixador",
			recipient_name: cliente.nome,
			recipient_phone: cliente.telefone,
		},
		payments: [
			{
				amount: (pagamento.total * 100).toFixed(0),
				payment_method: "checkout",
				checkout: {
					expires_in: 28800,
					billing_address_editable: false,
					customer_editable: true,
					accepted_payment_methods: ["pix"],
					success_url: "https://www.vinhosjolimont.com.br/",
					payment_method: "pix",
					pix: {
						expires_in: 28800,
					},
				},
			},
		],
	};

	try {
		const response = await axios.post(
			url,
			type === "PIX" ? dataPix : dataCredito,
			{
				auth: {
					username: username,
					password: "",
				},

				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		return {
			id: response.data.id,
			payment_url: response.data.checkouts[0].payment_url,
		};
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Erro ao criar pedido:",
				error.response?.data || error.message,
			);
		} else {
			console.error("Erro ao criar pedido:", error);
		}
	}
}
