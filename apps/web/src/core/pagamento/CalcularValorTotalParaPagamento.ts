import { descontos } from "@/core/premissas";
import type { Pagamento } from "./Pagamento";

type Resposta = {
	valorTotalParaPagamento: number;
};

export class CalcularValorTotalParaPagamento {
	executar({ valorTotal, opcaoDePagamento, estado }: Pagamento): Resposta {
		const descontoAplicado = descontos.find(
			(opcao) =>
				opcao.uf === estado && opcao.opcaoDePagamento === opcaoDePagamento,
		);

		if (descontoAplicado) {
			const valorTotalParaPagamento =
				valorTotal * (1 - descontoAplicado.desconto);
			return { valorTotalParaPagamento };
		}

		const valorTotalParaPagamento = valorTotal;

		return { valorTotalParaPagamento };
	}
}
