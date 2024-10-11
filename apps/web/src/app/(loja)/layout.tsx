import { Cabecalho } from "@/components/template/Cabecalho";
import { ProvedorCarrinho } from "@/data/context/ContextoCarrinho";
import type { ReactNode } from "react";
export default function LayoutLoja({ children }: { children: ReactNode }) {
	return (
		<ProvedorCarrinho>
			<Cabecalho withCarrinho />
			{children}
		</ProvedorCarrinho>
	);
}
