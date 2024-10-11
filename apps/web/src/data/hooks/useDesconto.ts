import { CalcularDesconto } from "@/core";

interface useDescontoProps {
	valor: number;
	opcaoDePagamento: "PIX" | "CREDITO";
	uf: string;
}

export function useDesconto({
	valor,
	opcaoDePagamento,
	uf,
}: useDescontoProps): number | null {
	const valorComDesconto = new CalcularDesconto().executar({
		valorTotal: valor,
		opcaoDePagamento: opcaoDePagamento,
		estado: uf,
	});
	return valorComDesconto;
}
