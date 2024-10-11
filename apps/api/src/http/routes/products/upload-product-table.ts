import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import * as xlsx from "xlsx";

import { set, z } from "zod";
import { prisma } from "@/lib/prisma";
import { getProductsOfBling } from "@/functions/bling/get-products";

const validHeaders = [
	"sku",
	"nome",
	"linha",
	"preco_mercado",
	"preco",
	"url_imagem_vtex",
] as const;

type HeaderKey = (typeof validHeaders)[number];

const dataTableHeaderSchema = z.array(
	z.string().refine((header) => validHeaders.includes(header as HeaderKey), {
		message: "Cabeçalho inválido encontrado na planilha.",
	}),
);

interface RowData {
	sku: string;
	nome: string;
	linha: string;
	preco_mercado: string;
	preco: string;
	url_imagem_vtex: string;
	rowIndex: number;
}

export async function updatePriceTable(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.post("/upload", async (request, reply) => {
			const data = await request.file();

			if (!data) {
				return reply.status(400).send({ error: "No file found" });
			}

			try {
				const fileBuffer = await data.toBuffer();
				const workbook = xlsx.read(fileBuffer, { type: "buffer" });
				const sheetNames = workbook.SheetNames;

				if (sheetNames.length === 0) {
					return reply
						.status(400)
						.send({ error: "O arquivo Excel não contém dados." });
				}

				const sheet = workbook.Sheets[sheetNames[0]];
				const jsonData = xlsx.utils.sheet_to_json(sheet, {
					header: 1,
				}) as unknown[][];

				const [headerRow, ...dataRows] = jsonData;

				if (!Array.isArray(headerRow) || headerRow.length === 0) {
					return reply
						.status(400)
						.send({ error: "Cabeçalho da planilha está vazio ou inválido." });
				}

				const headerValidation = dataTableHeaderSchema.safeParse(headerRow);

				if (!headerValidation.success) {
					return reply
						.status(400)
						.send({ error: headerValidation.error.message });
				}

				const headers = headerValidation.data as HeaderKey[];

				const mappedRows: RowData[] = dataRows.map((row, rowIndex) => {
					const rowData = {} as RowData;
					rowData.rowIndex = rowIndex + 2; // Ajuste para o índice da linha na planilha

					headers.forEach((header, index) => {
						const cellValue = row[index];
						if (typeof cellValue === "undefined" || cellValue === null) {
							rowData[header] = "";
						} else {
							rowData[header] = String(cellValue);
						}
					});

					return rowData;
				});

				for (const row of mappedRows) {
					for (const header of headers) {
						if (
							row[header as HeaderKey] === undefined ||
							row[header as HeaderKey] === null ||
							row[header as HeaderKey].trim() === ""
						) {
							return reply.status(400).send({
								error: `Dados faltando na coluna "${header}" na linha ${row.rowIndex}.`,
							});
						}
					}
				}

				const skuSet = new Set<string>();
				for (const row of mappedRows) {
					const sku = row.sku.trim();
					if (skuSet.has(sku)) {
						return reply.status(400).send({
							error: `SKU duplicado encontrado: "${sku}" na linha ${row.rowIndex}.`,
						});
					}

					skuSet.add(sku);
				}

				const existingProducts = await prisma.produto.findMany({
					select: { sku: true },
				});

				const existingSkuSet = new Set(
					existingProducts.map((p: { sku: string }) => p.sku),
				);

				for (const row of mappedRows) {
					const sku = row.sku.trim();

					const product = await prisma.produto.findFirst({
						where: { sku: sku },
					});

					let blingId = product?.blingId;

					if (!blingId) {
						const registerBling = await getProductsOfBling(sku);

						if (registerBling.length === 0) {
							return reply.status(400).send({
								error: `Produto com SKU "${sku}" não encontrado no Bling.`,
							});
						}

						blingId = registerBling[0].id.toString();
					}

					const data = {
						blingId,
						sku,
						nome: row.nome,
						linha: row.linha,
						precoDeMercado: Number.parseFloat(row.preco_mercado),
						preco: Number.parseFloat(row.preco),
						imagem: row.url_imagem_vtex,
						ativo: true,
					};

					if (existingSkuSet.has(sku)) {
						await prisma.produto.update({
							where: { sku: sku },
							data: data,
						});
					} else {
						await prisma.produto.create({ data });
					}
				}

				await prisma.produto.updateMany({
					where: {
						sku: { notIn: Array.from(skuSet) },
					},
					data: { ativo: false },
				});

				return reply.send({
					message:
						"O arquivo Excel foi lido e os produtos foram atualizados com sucesso.",
				});
			} catch (error) {
				console.error(error);
				return reply
					.status(500)
					.send({ error: "Erro ao ler o arquivo Excel." });
			}
		});
}
