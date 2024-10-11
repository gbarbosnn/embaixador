import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

export async function listProducts(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get("/products", async (_, reply) => {
		const products = await prisma.produto.findMany({
			where: {
				ativo: true,
			},
		});

		return reply.code(201).send(products);
	});
}
