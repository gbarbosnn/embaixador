"use client";

import React, {  useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader,
  Truck,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MaskedInput } from "@/components/ui/masked-input";
import { Moeda } from "@/core";
import { estadosBrasileiros } from "@/data/estadosBrasileiros";
import { useCarrinho } from "@/data/hooks/useCarrinho";
import { useDesconto } from "@/data/hooks/useDesconto";
import { env } from "@/env";

export default function Checkout() {
  const {
    itens,
    metodoPagamento: metodoPagamentoCarrinho,
    estadoSelecionado,
    limparCarrinho,
  } = useCarrinho();
  const router = useRouter();
  const [step, setStep] = useState(1);

  const steps = [
    { label: "Informações do Cliente", icon: User },
    { label: "Endereço de Entrega", icon: Truck },
    { label: "Pagamento", icon: CreditCard },
    { label: "Confirmar Pedido", icon: CheckCircle },
  ];

  const getEstadoNome = (sigla: string) => {
    const estado = estadosBrasileiros.find((e) => e.sigla === sigla);
    return estado ? estado.nome : sigla;
  };

  const subtotal = useMemo(() => {
    return itens.reduce((acc, item) => acc + item.preco * item.qtde, 0);
  }, [itens]);

  const valorComDesconto = useDesconto({
    valor: subtotal,
    opcaoDePagamento: metodoPagamentoCarrinho,
    uf: estadoSelecionado,
  });

  const total = valorComDesconto ?? subtotal;

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    estado: estadoSelecionado,
    cidade: "",
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    complemento: "",
    nomeRecebedor: "",
    metodoPagamento: metodoPagamentoCarrinho || "PIX",
    parcelas: 1,
  });

  const [cepValido, setCepValido] = useState(false); 
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      estado: estadoSelecionado,
    }));
  }, [estadoSelecionado]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const fieldValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const fetchAddress = async (cep: string, estado: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        console.error("CEP inválido");
        setFormErrors((prev) => ({ ...prev, cep: "CEP inválido" }));
        setCepValido(false);
        return;
      }

      if (data.uf !== estado) {
        setFormErrors((prev) => ({
          ...prev,
          cep: "O CEP não corresponde ao estado informado.",
        }));
        setCepValido(false);
        return;
      } else {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.cep;
          return newErrors;
        })
      }

      setCepValido(true); 
      setFormData((prev) => ({
        ...prev,
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
      }));
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      setCepValido(false);
    }
  };

  const debouncedFetchAddress = useMemo(
    () => debounce(fetchAddress, 1000),
    []
  );

  useEffect(() => {
    const cepNumeros = formData.cep.replace(/\D/g, ""); 

    if ( cepNumeros.length === 8 &&
      formData.estado 
    ) {
      debouncedFetchAddress(cepNumeros, formData.estado);
    } else {
      setCepValido(false);
    }

    return () => {
      debouncedFetchAddress.cancel();
    };
}, [formData.cep, formData.estado, formData.endereco, formData.bairro, formData.cidade, debouncedFetchAddress]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.nome) errors.nome = "Nome é obrigatório";
    if (!formData.email) {
      errors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido";
    }
    if (!formData.telefone) errors.telefone = "Telefone é obrigatório";
    if (step === 2) {
      if (!formData.cidade) errors.cidade = "Cidade é obrigatória";
      if (!formData.cep) errors.cep = "CEP é obrigatório";
      if (!formData.bairro) errors.bairro = "Bairro é obrigatório";
      if (!formData.endereco) errors.endereco = "Endereço é obrigatório";
      if (!formData.numero) errors.numero = "Número é obrigatório";
      if (!formData.nomeRecebedor)
        errors.nomeRecebedor = "Nome do recebedor é obrigatório";
      if (formErrors.cep) errors.cep = formErrors.cep;
    }
    if (step === 3) {
      if (!formData.metodoPagamento)
        errors.metodoPagamento = "Método de pagamento é obrigatório";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const cepSemFormatacao = formData.cep.replace(/\D/g, "");

    const pedido = {
      cliente: {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
      },
      enderecoEntrega: {
        estado: formData.estado,
        cidade: formData.cidade,
        cep: cepSemFormatacao, 
        endereco: formData.endereco,
        numero: formData.numero,
        bairro: formData.bairro,
        complemento: formData.complemento,
        nomeRecebedor: formData.nomeRecebedor,
      },
      pagamento: {
        metodo: formData.metodoPagamento,
        parcelas: parseFloat(formData.parcelas.toString()),
        subtotal: subtotal,
        total: total,
      },
      itens: itens,
    };

    try {
      setLoadingSubmit(true);
      setErrorMessage(null);

      const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedido),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Erro ao enviar o pedido: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Pedido enviado:", data);

      const { payment_url, id } = data;

      router.push(
        `/success?payment_url=${encodeURIComponent(
          payment_url
        )}&order_number=${id}`
      );
      limparCarrinho();
    } catch (error: unknown) {
      console.error("Erro ao enviar o pedido:", error);
      setErrorMessage(
        (error instanceof Error ? error.message : String(error)) ||
          "Não foi possível finalizar o pedido. Tente novamente."
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  const nextStep = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = itens.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(itens.length / itemsPerPage);

  const renderPaginationControls = () => {
    return (
      <div className="flex items-center justify-center mt-4 space-x-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2" /> Informações do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      required
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                    />
                    {formErrors.nome && (
                      <p className="text-red-500 text-sm">{formErrors.nome}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <MaskedInput
                      mask="(99) 99999-9999"
                      id="telefone"
                      required
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                    />
                    {formErrors.telefone && (
                      <p className="text-red-500 text-sm">
                        {formErrors.telefone}
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2" /> Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        name="estado"
                        value={getEstadoNome(formData.estado)}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <MaskedInput
                        mask="99999-999"
                        id="cep"
                        required
                        name="cep"
                        value={formData.cep}
                        onChange={handleChange}
                        placeholder="00000-000"
                      />
                      {formErrors.cep && (
                        <p className="text-red-500 text-sm">
                          {formErrors.cep}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        required
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        placeholder="Sua cidade"
                        disabled={!cepValido}
                      />
                      {formErrors.cidade && (
                        <p className="text-red-500 text-sm">
                          {formErrors.cidade}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        required
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                        placeholder="Seu bairro"
                        disabled={!cepValido}
                      />
                      {formErrors.bairro && (
                        <p className="text-red-500 text-sm">
                          {formErrors.bairro}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      required
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                      placeholder="Rua, Avenida, etc."
                      disabled={!cepValido}
                    />
                    {formErrors.endereco && (
                      <p className="text-red-500 text-sm">
                        {formErrors.endereco}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        required
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        placeholder="Número"
                        disabled={!cepValido}
                      />
                      {formErrors.numero && (
                        <p className="text-red-500 text-sm">
                          {formErrors.numero}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        name="complemento"
                        value={formData.complemento}
                        onChange={handleChange}
                        placeholder="Apto, Bloco, etc."
                        disabled={!cepValido}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomeRecebedor">Nome do Recebedor</Label>
                    <Input
                      id="nomeRecebedor"
                      required
                      name="nomeRecebedor"
                      value={formData.nomeRecebedor}
                      onChange={handleChange}
                      placeholder="Nome de quem vai receber"
                      disabled={!cepValido}
                    />
                    {formErrors.nomeRecebedor && (
                      <p className="text-red-500 text-sm">
                        {formErrors.nomeRecebedor}
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2" /> Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label>Método de Pagamento</Label>
                    <Input
                      name="metodoPagamento"
                      value={
                        formData.metodoPagamento === "PIX"
                          ? "PIX"
                          : "Cartão de Crédito"
                      }
                      readOnly
                      disabled
                    />
                  </div>
                  {formData.metodoPagamento === "CREDITO" && (
                    <div className="space-y-2">
                      <Label>Número de Parcelas</Label>
                      <select
                        name="parcelas"
                        value={formData.parcelas}
                        onChange={handleChange}
                        className="border rounded p-2 w-full"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (num) => (
                            <option key={num} value={num}>
                              {num}x de {Moeda.formatar(total / num)} sem juros
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2" /> Confirmar Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Informações do Cliente</h3>
                    <p>{formData.nome}</p>
                    <p>{formData.email}</p>
                    <p>{formData.telefone}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Endereço de Entrega</h3>
                    <p>
                      {formData.endereco}, {formData.numero}
                    </p>
                    <p>
                      {formData.bairro}, {formData.cidade} -{" "}
                      {getEstadoNome(formData.estado)}
                    </p>
                    <p>CEP: {formData.cep}</p>
                    <p>Recebedor: {formData.nomeRecebedor}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Resumo do Pedido</h3>
                    <p>Total: {Moeda.formatar(total)}</p>
                    <p>
                      Método de Pagamento:{" "}
                      {formData.metodoPagamento === "PIX"
                        ? "PIX"
                        : "Cartão de Crédito"}
                    </p>
                    {formData.metodoPagamento === "CREDITO" && (
                      <p>
                        Número de Parcelas: {formData.parcelas}x de{" "}
                        {Moeda.formatar(total / formData.parcelas)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>

      <div className="mb-8 flex justify-center">
        {steps.map((stepItem, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`flex flex-col items-center ${
                index + 1 === step ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <stepItem.icon className="h-6 w-6" />
              <span className="text-sm">{stepItem.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 border-t-2 border-gray-300 mx-2"></div>
            )}
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="text-red-500 mb-4 text-center">{errorMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {renderStep()}
          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <Button onClick={prevStep} variant="outline">
                Voltar
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={nextStep} className="ml-auto">
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="ml-auto bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <>
                    <Loader className="mr-2 animate-spin" />
                    Processando, por favor aguarde...
                  </>
                ) : (
                  "Finalizar Pedido"
                )}
              </Button>
            )}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2" />
                Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentItems.length > 0 ? (
                <div className="space-y-4">
                  {currentItems.map((item) => (
                    <div
                      key={item.idProduto}
                      className="flex items-center space-x-4 w-full"
                    >
                      <Image
                        src={item.imagem}
                        alt={item.nome}
                        width={64}
                        height={64}
                        className="object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold">{item.nome}</h3>
                        <p className="text-xs text-gray-600">
                          Qtd: {item.qtde} x {Moeda.formatar(item.preco)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {Moeda.formatar(item.preco * item.qtde)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {renderPaginationControls()}
                </div>
              ) : (
                <p>Seu carrinho está vazio.</p>
              )}
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{Moeda.formatar(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total com descontos</span>
                  <span>{Moeda.formatar(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Método de Pagamento</span>
                  <span>
                    {formData.metodoPagamento === "PIX"
                      ? "PIX"
                      : "Cartão de Crédito"}
                  </span>
                </div>
                {formData.metodoPagamento === "CREDITO" && (
                  <div className="flex justify-between text-sm">
                    <span>Parcelas</span>
                    <span>
                      {formData.parcelas}x de{" "}
                      {Moeda.formatar(total / formData.parcelas)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
