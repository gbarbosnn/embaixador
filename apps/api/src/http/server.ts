import { fastify } from "fastify";
import fastifyCors from "@fastify/cors";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { fastifyMultipart } from "@fastify/multipart";
import { createAccount } from "./routes/auth/create-account";
import { updatePriceTable } from "./routes/products/upload-product-table";
import { listProducts } from "./routes/products/list-products";
import { createOrder } from "./routes/orders/create-order";
import { env } from "@/env";
import { webhook } from "./routes/orders/webhook-order-paid";
import { webhookOrderInvoiced } from "./routes/orders/webhookup";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyMultipart);
app.register(fastifyCors, {
	origin: true, 
	methods: ["GET", "POST", "PUT", "DELETE"], 
	credentials: true, 
});



app.register(createAccount);
app.register(updatePriceTable);
app.register(listProducts);
app.register(createOrder);
app.register(webhook);
app.register(webhookOrderInvoiced);

app
	.listen({
		host: "0.0.0.0",
		port: env.PORT,
	})
	.then(() => {
		console.log("HTTP server is running!");
	});
