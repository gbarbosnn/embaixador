"use client";

import { type ReactNode, createContext, useEffect, useState } from "react";

export interface ItemCarrinho {
	idProduto: string;
	nome: string;
	linha: string;
	preco: number;
	precoDeMercado: number;
	imagem: string;
	qtde: number;
}

interface TipoContextoCarrinho {
	itens: ItemCarrinho[];
	adicionarAoCarrinho: (item: ItemCarrinho) => void;
	removerDoCarrinho: (idProduto: string) => void;
	aumentarQuantidade: (idProduto: string) => void;
	diminuirQuantidade: (idProduto: string) => void;
	metodoPagamento: "PIX" | "CREDITO";
	estadoSelecionado: string;
	setMetodoPagamento: React.Dispatch<React.SetStateAction<"PIX" | "CREDITO">>;
	setEstadoSelecionado: (estado: string) => void;
	limparCarrinho: () => void;
}

export const ContextoCarrinho = createContext({} as TipoContextoCarrinho);

export function ProvedorCarrinho({ children }: { children: ReactNode }) {
	const [itensCarrinho, setItensCarrinhos] = useState<ItemCarrinho[]>([]);
	const [metodoPagamento, setMetodoPagamento] = useState<"PIX" | "CREDITO">(
		"PIX",
	);
	const [estadoSelecionado, setEstadoSelecionado] = useState<string>("");
	const [carregado, setCarregado] = useState(false); // Estado para verificar se já carregou

	// Carregar dados do localStorage apenas após a montagem do componente
	useEffect(() => {
		if (typeof window !== "undefined") {
			const carrinho = localStorage.getItem("carrinho");
			const metodo = localStorage.getItem("metodoPagamento");
			const estado = localStorage.getItem("estadoSelecionado");

			setItensCarrinhos(carrinho ? JSON.parse(carrinho) : []);
			setMetodoPagamento(metodo === "CREDITO" ? "CREDITO" : "PIX");
			setEstadoSelecionado(estado || "");

			setCarregado(true); // Marcar como carregado
		}
	}, []);

	useEffect(() => {
		if (carregado) {
			localStorage.setItem("carrinho", JSON.stringify(itensCarrinho));
		}
	}, [itensCarrinho, carregado]);

	useEffect(() => {
		if (carregado) {
			localStorage.setItem("metodoPagamento", metodoPagamento);
		}
	}, [metodoPagamento, carregado]);

	useEffect(() => {
		if (carregado) {
			localStorage.setItem("estadoSelecionado", estadoSelecionado);
		}
	}, [estadoSelecionado, carregado]);

	function adicionarAoCarrinho(item: ItemCarrinho) {
		setItensCarrinhos((state) => {
			const produtoNoCarrinho = state.some(
				(i) => i.idProduto === item.idProduto,
			);
	
			if (produtoNoCarrinho) {
				return state.map((i) => {
					if (i.idProduto === item.idProduto) {
						return { ...i, qtde: i.qtde + 1 };
					}
					return i;
				});
			}
	
			// Insere o novo item no início do array
			return [{ ...item, qtde: 1 }, ...state];
		});
	}

	function removerDoCarrinho(idProduto: string) {
		setItensCarrinhos((state) =>
			state.filter((item) => item.idProduto !== idProduto),
		);
	}

	function aumentarQuantidade(idProduto: string) {
		setItensCarrinhos((state) =>
			state.map((item) =>
				item.idProduto === idProduto ? { ...item, qtde: item.qtde + 1 } : item,
			),
		);
	}

	function diminuirQuantidade(idProduto: string) {
		setItensCarrinhos((state) =>
			state
				.map((item) =>
					item.idProduto === idProduto
						? { ...item, qtde: item.qtde - 1 }
						: item,
				)
				.filter((item) => item.qtde > 0),
		);
	}

	function limparCarrinho() {
		setItensCarrinhos([]);
		localStorage.removeItem("carrinho");
	}

	// Não renderizar o conteúdo até que esteja carregado
	if (!carregado) {
		return null; // Ou algum tipo de loading, se preferir
	}

	return (
		<ContextoCarrinho.Provider
			value={{
				itens: itensCarrinho,
				adicionarAoCarrinho,
				removerDoCarrinho,
				aumentarQuantidade,
				diminuirQuantidade,
				metodoPagamento,
				estadoSelecionado,
				setMetodoPagamento,
				setEstadoSelecionado,
				limparCarrinho,
			}}
		>
			{children}
		</ContextoCarrinho.Provider>
	);
}
