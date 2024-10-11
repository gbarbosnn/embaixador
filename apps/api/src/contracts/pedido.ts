import { z } from "zod";

const ClienteSchema = z.object({
	email: z.string().email(),
	nome: z.string(),
	telefone: z.string(),
});

const EnderecoEntregaSchema = z.object({
	bairro: z.string(),
	cep: z.string().regex(/^\d{8}$/, "CEP inválido"),
	cidade: z.string(),
	complemento: z.string().optional(),
	endereco: z.string(),
	estado: z.string().length(2, "Estado deve ter 2 caracteres"),
	nomeRecebedor: z.string(),
	numero: z.string(),
});

const ItemSchema = z.object({
	idProduto: z.string(),
	preco: z.number().positive(),
	qtde: z.number().min(1),
});

const PagamentoSchema = z.object({
	metodo: z.enum(["PIX", "CREDITO"]),
	parcelas: z.number().int().optional(),
	subtotal: z.number().positive(),
	total: z.number().positive(),
});

export const PedidoSchema = z.object({
	cliente: ClienteSchema,
	enderecoEntrega: EnderecoEntregaSchema,
	itens: z.array(ItemSchema).nonempty(),
	pagamento: PagamentoSchema,
});

export type Pedido = z.infer<typeof PedidoSchema>;
