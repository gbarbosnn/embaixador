
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

export async function webhookOrderInvoiced(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post("/webhook/order-invoiced", async (request, reply) => {
		console.log(request)

		reply.status(200).send()
	});
}
