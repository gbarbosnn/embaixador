import type { Pedido } from "@/contracts/pedido";
import axios from "axios";
import { getAccessToken } from "./get-access-token";
import { refreshToken } from "./get-refresh-token";
import { prisma } from "@/lib/prisma";

async function findBlingSku(idProduto: string) {
	const product = await prisma.produto.findFirst({ where: { sku: idProduto } });
	if (!product) throw new Error("Produto não encontrado");
	return product.blingId;
}

async function buildOrderItems(itens: Pedido['itens']) {
	return await Promise.all(
		itens.map(async (item) => ({
			quantidade: item.qtde,
			valor: item.preco,
			codigo: await findBlingSku(item.idProduto),
			unidade: "UN",
			desconto: 0,
			aliquotaIPI: 0,
			produto: { id: await findBlingSku(item.idProduto) },
			comissao: { base: 0, aliquota: 0, valor: 0 },
		}))
	);
}

export async function createOrderOnBling(pedido: Pedido, idPedido: string) {
	console.log("Criando pedido no Bling...");
	let accessToken = await getAccessToken();

	const orderItems = await buildOrderItems(pedido.itens);

	const data = {
		observacoesInternas: "EMBAIXADORES",
		vendedor: { id: 15596282691 },
		numero: idPedido,
		numeroLoja: idPedido,
		contato: {
			id: "16865601944",
			nome: pedido.cliente.nome,
			tipoPessoa: "E",
			numeroDocumento: "03892161003",
		},
		data: new Date().toISOString().split("T")[0],
		itens: orderItems,
		totalProdutos: pedido.pagamento.total,
		total: pedido.pagamento.total,
		transporte: {
			fretePorConta: 1,
			etiqueta: {
				nome: pedido.enderecoEntrega.nomeRecebedor,
				endereco: pedido.enderecoEntrega.endereco,
				numero: pedido.enderecoEntrega.numero,
				complemento: pedido.enderecoEntrega.complemento || "",
				municipio: pedido.enderecoEntrega.cidade,
				uf: pedido.enderecoEntrega.estado,
				cep: pedido.enderecoEntrega.cep,
				bairro: pedido.enderecoEntrega.bairro,
				nomePais: "Brasil",
			},
		},
	};

	try {
		const response = await axios.post("https://bling.com.br/Api/v3/pedidos/vendas", data, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error("Erro ao enviar pedido ao Bling:", JSON.stringify(error.response?.data, null, 2));

			if (error.response?.data?.error?.type === "invalid_token") {
				console.log("Token expirado, renovando...");
				await refreshToken();
				accessToken = await getAccessToken();
				return await createOrderOnBling(pedido, idPedido);
			}
		}
		throw error;
	}
}	