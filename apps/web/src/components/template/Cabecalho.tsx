import Link from "next/link";
import Carrinho from "../carrinho/Carrinho";

interface CabecalhoProps {
	withCarrinho?: boolean;
	isCheckout?: boolean;
}

export function Cabecalho(props: CabecalhoProps) {
	return (
		<header className="bg-zinc-900 w-full fixed top-0 left-0 z-50">
			<div className="h-16 max-w-7xl mx-auto flex items-center justify-between px-4">
				<Link href="/" passHref>
					<span className="text-white cursor-pointer font-medium text-lg">
						Embaixadores - Jolimont
					</span>
				</Link>

				{!props.withCarrinho && props.isCheckout && (
					<span className="text-white cursor-pointer font-medium text-lg">
						Resumo do Pedido
					</span>
				)}

				{props.withCarrinho && <Carrinho tipo="icon" />}
			</div>
		</header>
	);
}
