"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Copy } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaginaSucessoPedido() {
  const searchParams = useSearchParams();
  const paymentUrl = searchParams.get("payment_url");
  const orderNumber = searchParams.get("order_number");

  const [detalhesPedido, setDetalhesPedido] = useState({
    numeroPedido: "",
    linkPagamento: "",
  });

  useEffect(() => {
    setDetalhesPedido({
      numeroPedido: orderNumber || "",
      linkPagamento: paymentUrl || "",
    });
  }, [orderNumber, paymentUrl]);

  async function copiarParaClipboard() {
    const link = detalhesPedido.linkPagamento;
    if (link) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(link);
          toast.success("Link de pagamento copiado! 🥂");
        } else {
          // Fallback manual
          const inputElement = document.getElementById("linkPagamento") as HTMLInputElement;
          inputElement.select();
          document.execCommand("copy");
          toast.success("Link de pagamento copiado! 🥂");
        }
      } catch (error: unknown) {
        console.error(error);
        let errorMessage = "Ocorreu um erro ao copiar o link.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error("Erro ao copiar o link de pagamento.", {
          description: errorMessage,
        });
      }
    } else {
      toast.error("Erro ao copiar o link de pagamento.", {
        description: "O link de pagamento não está disponível.",
      });
    }
  }
  
  return (
    <div className="flex items-center mx-auto justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex flex-col items-center text-center">
            <CheckCircle className="text-green-500 w-12 h-12 mb-4" />
            Pedido Realizado com Sucesso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Número do pedido: <strong>{detalhesPedido.numeroPedido}</strong>
          </p>
          <div>
            <label
              htmlFor="linkPagamento"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Link de Pagamento:
            </label>
            <div className="flex space-x-2">
              <Input
                id="linkPagamento"
                value={detalhesPedido.linkPagamento}
                readOnly
                className="flex-grow"
              />
              <Button
                onClick={copiarParaClipboard}
                variant="outline"
                size="icon"
                aria-label="Copiar link de pagamento"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <Link href="/">Voltar para a loja</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
