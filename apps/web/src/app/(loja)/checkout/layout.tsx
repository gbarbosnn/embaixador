import { Cabecalho } from "@/components/template/Cabecalho";
import { ProvedorCarrinho } from "@/data/context/ContextoCarrinho";
import type { ReactNode } from "react";

export default function LayoutLoja({ children }: { children: ReactNode }) {
	return (
		<ProvedorCarrinho>
			<Cabecalho isCheckout />
			<div className="mt-12 sm:mt-14 lg:mt-16">{children}</div>
		</ProvedorCarrinho>
	);
}
