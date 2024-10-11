import { Cabecalho } from "@/components/template/Cabecalho";
import { ProvedorCarrinho } from "@/data/context/ContextoCarrinho";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

export default function LayoutLoja({ children }: { children: ReactNode }) {
	return (
		<ProvedorCarrinho>
			<Cabecalho />
			<div className="pt-20">{children}</div>
			<Toaster richColors position="top-right" />
		</ProvedorCarrinho>
	);
}
