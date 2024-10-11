export interface Pagamento {
	valorTotal: number;
	opcaoDePagamento: "PIX" | "CREDITO";
	estado: string;
}
