"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Moeda, type Produto } from "@/core";
import Image from "next/image";

import Carrinho from "../carrinho/Carrinho";

export interface ProdutoItemProps {
	produto: Produto;
}

export default function ProdutoItem(props: ProdutoItemProps) {
	const { produto } = props;
	return (
		<Card className="flex flex-col items-center justify-between p-4">
			<CardContent className="w-full flex justify-center items-center">
					<div className="relative w-full h-48 flex justify-center items-center p-2">
						{produto.imagem ? (
							<Image
								src={produto.imagem}
								alt={`Imagem do produto ${produto.nome}`}
								width={200}
								height={200}
								style={{
									objectFit: "contain",
									objectPosition: "center",
									maxHeight: "100%",
								}}
								className="transition duration-300 ease-in-out hover:scale-125"
							/>
						) : (
							<div className="text-white">Imagem não disponível</div>
						)}
					</div>
					<div className="flex flex-col space-y-4 text-sm">
						<span className="text-sm text-muted-foreground line-through ">
							De: {Moeda.formatar(produto.precoDeMercado)}
						</span>
						<span className="text-xl text-foreground">
							Por:{" "}
							<strong className="text-emerald-500">
								{Moeda.formatar(produto.preco)}
							</strong>
						</span>

						<span className="text-foreground text-xs text-nowrap">
							<strong className="text-red-500">
								{((produto.preco / produto.precoDeMercado) * 100)
									.toFixed(2)
									.replace(".", ",")}
								%
							</strong>{" "}
							de margem
						</span>
					</div>

			</CardContent>
			<Separator />
			<div className="flex flex-col items-center text-center">
				<span className="font-semibold text-lg text-foreground">
					{produto.nome}
				</span>
				<span className="text-sm text-muted-foreground">{produto.linha}</span>
			</div>
			<Separator />
			<CardFooter className="w-full m-4 items-center justify-center">
				<Carrinho produto={produto} tipo="button" />
			</CardFooter>
		</Card>
	);
}
