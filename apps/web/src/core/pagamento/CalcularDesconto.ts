import { descontos } from "@/core/premissas";
import type { Pagamento } from "./Pagamento";

export class CalcularDesconto {
	executar({ valorTotal, opcaoDePagamento, estado }: Pagamento): number | null {
		const descontoAplicado = descontos.find(
			(opcao) =>
				opcao.uf === estado && opcao.opcaoDePagamento === opcaoDePagamento,
		);

		if (descontoAplicado) {
			const valorTotalParaPagamento =
				valorTotal * (1 - descontoAplicado.desconto);

			return valorTotalParaPagamento;
		}

		return null;
	}
}
