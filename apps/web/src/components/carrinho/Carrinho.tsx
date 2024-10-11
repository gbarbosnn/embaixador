"use client";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Moeda, type Produto } from "@/core";
import { useCarrinho } from "@/data/hooks/useCarrinho";
import { useDesconto } from "@/data/hooks/useDesconto";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import ProdutoCarrinho from "./ProdutoCarrinho";
import Image from "next/image";

interface CarrinhoProps {
	produto?: Produto;
	tipo: "icon" | "button";
}

export default function Carrinho({ produto, tipo }: CarrinhoProps) {
	const [open, setOpen] = useState(false);
	const {
		itens,
		adicionarAoCarrinho,
		aumentarQuantidade,
		diminuirQuantidade,
		removerDoCarrinho,
		metodoPagamento,
		estadoSelecionado,
		setMetodoPagamento,
		setEstadoSelecionado,
	} = useCarrinho();

	const router = useRouter();

	const itensNoCarrinho = useMemo(() => {
		return itens.reduce((acc, item) => acc + item.qtde, 0);
	}, [itens]);

	useEffect(() => {
		console.log("Itens", itensNoCarrinho);
	}, [itensNoCarrinho]);

	const handleSelectChange = (
		key: "estado" | "opcaoDePagamento",
		value: string,
	) => {
		if (key === "estado") {
			setEstadoSelecionado(value);
		} else if (key === "opcaoDePagamento") {
			setMetodoPagamento(value as "PIX" | "CREDITO");
		}
	};

	const subtotal = useMemo(() => {
		return itens.reduce((acc, item) => acc + item.preco * item.qtde, 0);
	}, [itens]);

	const valorComDescontoPix = useDesconto({
		valor: subtotal,
		opcaoDePagamento: "PIX",
		uf: estadoSelecionado,
	});

	const valorComDescontoCartao = useDesconto({
		valor: subtotal,
		opcaoDePagamento: "CREDITO",
		uf: estadoSelecionado,
	});

	const valorPixFormatado = useMemo(
		() => Moeda.formatar(valorComDescontoPix ?? subtotal),
		[valorComDescontoPix, subtotal],
	);

	const valorCartaoFormatado = useMemo(
		() => Moeda.formatar(valorComDescontoCartao ?? subtotal),
		[valorComDescontoCartao, subtotal],
	);

	const total = useMemo(() => {
		if (metodoPagamento === "PIX") {
			return valorComDescontoPix ?? subtotal;
		}
		if (metodoPagamento === "CREDITO") {
			return valorComDescontoCartao ?? subtotal;
		}
		return subtotal;
	}, [metodoPagamento, valorComDescontoPix, valorComDescontoCartao, subtotal]);

	return (
<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>
    {tipo === "button" && produto ? (
      <Button
        size="lg"
        className="w-full rounded bg-emerald-600 text-white hover:bg-emerald-700 transition gap-2"
        onClick={() => {
          setOpen(true);
          adicionarAoCarrinho({
            idProduto: produto.id,
            imagem: produto.imagem,
            linha: produto.linha,
            nome: produto.nome,
            preco: produto.preco,
            qtde: 1,
            precoDeMercado: produto.precoDeMercado,
          });
        }}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Adicionar ao carrinho
      </Button>
    ) : (
      <Button
        className="flex justify-center items-center relative w-15 bg-zinc-800 hover:bg-zinc-700 rounded-full"
        onClick={() => setOpen(true)}
      >
        <ShoppingCart className="w-5 h-5 text-white" />
        {itensNoCarrinho > 0 && (
          <span className="absolute -bottom-1 -right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itensNoCarrinho}
          </span>
        )}
      </Button>
    )}
  </SheetTrigger>

  <SheetContent className="w-full sm:max-w-lg min-h-screen flex flex-col justify-between">
    <SheetHeader>
      <SheetTitle className="text-start text-2xl font-bold">Carrinho</SheetTitle>
    </SheetHeader>

    <div className="mt-4 space-y-4 flex-1 overflow-y-auto pr-4">
      {itens.length > 0 ? (
        itens.map((item) => (
          <ProdutoCarrinho
            key={item.idProduto}
            id={item.idProduto}
            imagem={item.imagem}
            linha={item.linha}
            nome={item.nome}
            preco={item.preco}
            quantidade={item.qtde}
            precoDeMercado={item.precoDeMercado}
            aumentarQuantidade={aumentarQuantidade}
            diminuirQuantidade={diminuirQuantidade}
            removerDoCarrinho={removerDoCarrinho}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <Image
            src="/carrinho-vazio.png"
            width={192}
            height={192}
            alt="Carrinho vazio"
            className="mb-4"
          />
          <p className="text-xl font-semibold">Seu carrinho está vazio</p>
          <p className="text-gray-500">Que tal adicionar alguns produtos?</p>
        </div>
      )}
    </div>

    {itens.length > 0 && (
      <div className="mt-4 space-y-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Subtotal</span>
          <span>{Moeda.formatar(subtotal)}</span>
        </div>

        <Separator />

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="estado"
            className="block text-sm font-medium text-gray-700"
          >
            Informe seu estado:
          </label>
          <Select
            onValueChange={(value) => handleSelectChange("estado", value)}
            value={estadoSelecionado}
          >
            <SelectTrigger id="estado" className="w-full">
              <SelectValue placeholder="Selecione seu estado" />
            </SelectTrigger>
            <SelectContent>
						<SelectItem value="AC">AC - Acre</SelectItem>
									<SelectItem value="AL">AL - Alagoas</SelectItem>
									<SelectItem value="AP">AP - Amapá</SelectItem>
									<SelectItem value="AM">AM - Amazonas</SelectItem>
									<SelectItem value="BA">BA - Bahia</SelectItem>
									<SelectItem value="CE">CE - Ceará</SelectItem>
									<SelectItem value="DF">DF - Distrito Federal</SelectItem>
									<SelectItem value="ES">ES - Espírito Santo</SelectItem>
									<SelectItem value="GO">GO - Goiás</SelectItem>
									<SelectItem value="MA">MA - Maranhão</SelectItem>
									<SelectItem value="MT">MT - Mato Grosso</SelectItem>
									<SelectItem value="MS">MS - Mato Grosso do Sul</SelectItem>
									<SelectItem value="MG">MG - Minas Gerais</SelectItem>
									<SelectItem value="PA">PA - Pará</SelectItem>
									<SelectItem value="PB">PB - Paraíba</SelectItem>
									<SelectItem value="PR">PR - Paraná</SelectItem>
									<SelectItem value="PE">PE - Pernambuco</SelectItem>
									<SelectItem value="PI">PI - Piauí</SelectItem>
									<SelectItem value="RJ">RJ - Rio de Janeiro</SelectItem>
									<SelectItem value="RN">RN - Rio Grande do Norte</SelectItem>
									<SelectItem value="RS">RS - Rio Grande do Sul</SelectItem>
									<SelectItem value="RO">RO - Rondônia</SelectItem>
									<SelectItem value="RR">RR - Roraima</SelectItem>
									<SelectItem value="SC">SC - Santa Catarina</SelectItem>
									<SelectItem value="SP">SP - São Paulo</SelectItem>
									<SelectItem value="SE">SE - Sergipe</SelectItem>
									<SelectItem value="TO">TO - Tocantins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {estadoSelecionado && (
          <RadioGroup
            value={metodoPagamento}
            onValueChange={(value) => handleSelectChange("opcaoDePagamento", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PIX" id="PIX" />
              <Label htmlFor="PIX">
                Pagando via PIX: {valorPixFormatado}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CREDITO" id="CREDITO" />
              <Label htmlFor="CREDITO">
                Pagando com cartão de crédito: {valorCartaoFormatado}
              </Label>
            </div>
          </RadioGroup>
        )}

        {metodoPagamento && estadoSelecionado && (
          <div className="space-y-4 mt-4">
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>{Moeda.formatar(total ?? 0)}</span>
            </div>

            {/* Botão de checkout sempre visível ao final */}
            <Button
              size="lg"
              className="w-full rounded bg-emerald-600 text-white hover:bg-emerald-700 transition gap-2 sticky bottom-0 mb-5"
              onClick={() => {
                setOpen(false);
                router.push("/checkout");
              }}
            >
              Ir para o check-out
            </Button>
          </div>
        )}
      </div>
    )}
  </SheetContent>
</Sheet>

	);
}
