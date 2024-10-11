import axios from "axios";
import { getAccessToken } from "./get-access-token";
import { refreshToken } from "./get-refresh-token";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

interface EstoqueBling {
    saldoVirtualTotal: number;
}

interface ProdutoBling {
    id: number;
    nome: string;
    codigo: string;
    preco: number;
    precoCusto: number;
    estoque: EstoqueBling;
    tipo: string;
    situacao: string;
    formato: string;
    descricaoCurta: string;
    imagemURL: string;
}

interface ProdutosBlingResponse {
    error: { type: string; message: string } | null;
    data: ProdutoBling[];
}

export async function getProductsOfBling(sku: string): Promise<ProdutoBling[]> {
    let accessToken = await getAccessToken();

    try {
        await sleep(1000); 

        const response = await axios.get<ProdutosBlingResponse>(
            `https://bling.com.br/Api/v3/produtos?codigo=${sku}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            },
        );

        
        if (response.data.error?.type === "invalid_token") {
            console.log("Token expirado, renovando...");
            await refreshToken();
            accessToken = await getAccessToken(); 

            const products: ProdutoBling[] = await getProductsOfBling(sku);
            return products;
        }

        return response.data.data;
    } catch (error) {
        if ((error as axios.AxiosError).response?.status === 401) {
            console.log("Erro 401: Token expirado ou inválido, renovando...");

            await refreshToken(); 
            accessToken = await getAccessToken(); 

            const products: ProdutoBling[] = await getProductsOfBling(sku);
            return products;
        }

        console.error(
            "Erro ao buscar produto no Bling:",
            JSON.stringify((error as axios.AxiosError).response?.data, null, 2),
        );
        throw error;
    }
}
