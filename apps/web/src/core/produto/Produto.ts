export interface Produto {
	id: string;
	sku: string;
	nome: string;
	linha: string;
	precoDeMercado: number;
	preco: number;
	imagem: string;
	tags: string[];
}
