import { Button } from "@/components/ui/button";
import { Moeda } from "@/core";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface ItemCarrinhoProps {
	id: string;
	nome: string;
	linha: string;
	preco: number;
	imagem: string;
	quantidade: number;
	precoDeMercado: number;
	aumentarQuantidade: (idProduto: string) => void;
	diminuirQuantidade: (idProduto: string) => void;
	removerDoCarrinho: (idProduto: string) => void;
	isReadOnly?: boolean;
}

export default function ProdutoCarrinho(props: ItemCarrinhoProps) {
	const {
		id,
		nome,
		linha,
		preco,
		imagem,
		quantidade,
		precoDeMercado,
		aumentarQuantidade,
		diminuirQuantidade,
		removerDoCarrinho,
		isReadOnly = false,
	} = props;

	return (
		<div className="grid grid-cols-3 gap-4 pb-6 border-b border-gray-200 w-full">
			<div className="relative w-20 h-20 rounded-md min-w-[80px] min-h-[80px] items-start mx-auto">
				<Image alt={nome} src={imagem} width={75} height={75} />
			</div>

			<div className="flex flex-col justify-between space-y-2">
				<div>
					<h3 className="font-bold text-sm">{nome}</h3>
					<p className="text-sm text-gray-600">{linha}</p>
				</div>
				<div>
					<p className="text-gray-500 line-through text-sm">
						{Moeda.formatar(precoDeMercado)}
					</p>
					<p className="font-bold text-lg text-primary">
						{Moeda.formatar(preco)}
					</p>
				</div>
			</div>
			{!isReadOnly && (
				<div className="grid grid-cols-1 grid-rows-2 gap-2 justify-items-end">
					<div className="flex justify-end">
						<Button
							variant="ghost"
							size="icon"
							className="text-red-500 hover:text-red-700 hover:bg-red-50"
							aria-label="Remover item"
							onClick={() => removerDoCarrinho(id)}
						>
							<Trash2 className="w-5 h-5" />
						</Button>
					</div>

					<div className="flex items-center border rounded-md overflow-hidden max-h-[44px]">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							aria-label="Diminuir quantidade"
							onClick={() => diminuirQuantidade(id)}
						>
							<Minus className="w-4 h-4" />
						</Button>
						<span className="px-4 py-2 font-semibold text-lg">
							{quantidade}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							aria-label="Aumentar quantidade"
							onClick={() => aumentarQuantidade(id)}
						>
							<Plus className="w-4 h-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
