"use client";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import ProdutoItem from "./ProdutoItem";
import type { Produto } from "@/core";
import { env } from "@/env";
import Image from "next/image";

export function ListaProdutos() {
	const [termoBusca, setTermoBusca] = useState("");
	const [produtos, setProdutos] = useState<Produto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const handleBusca = (evento: React.ChangeEvent<HTMLInputElement>) => {
		setTermoBusca(evento.target.value);
	};

	useEffect(() => {
		const fetchProdutos = async () => {
			try {
				const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/products`);

				if (!response.ok) {
					throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
				}

				const data = await response.json();
				setProdutos(data);
			} catch (error) {
				console.error("Erro ao buscar produtos:", error);
				setError(error as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchProdutos();
	}, []);

	// Filtra os produtos com base no termo de busca
	const produtosFiltrados = produtos.filter((produto) =>
		produto.nome.toLocaleLowerCase().includes(termoBusca.toLocaleLowerCase()),
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				Carregando...
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-red-500">
					Erro ao carregar os produtos: {error.message}
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto pt-24 p-4">
			<div className="relative mb-4">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
				</div>
				<input
					type="text"
					placeholder="Buscar produtos..."
					value={termoBusca}
					onChange={handleBusca}
					aria-label="Buscar produtos"
					className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
				/>
			</div>

			<div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
				{produtosFiltrados.length > 0 ? (
					produtosFiltrados.map((produto) => (
						<ProdutoItem key={produto.id} produto={produto} />
					))
				) : (
					<div className="col-span-3 text-center py-10">
						<div className="flex flex-col items-center justify-center">
							<Image
								src="/no-items.png"
								alt="Produto não encontrado"
								width={192}
								height={192}
								className="mb-4"
							/>
							<p className="text-gray-500 text-lg">
								Nenhum produto encontrado.
							</p>
							<p className="text-gray-400 mt-2">
								Tente modificar sua busca ou redefinir o filtro
							</p>
							<Button
								onClick={() => setTermoBusca("")}
								className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition duration-200"
							>
								Redefinir Busca
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
