import fs from "node:fs/promises";
import { refreshAccessToken } from "./auth";

export async function refreshToken(): Promise<void> {
	try {
		const data = await fs.readFile("tokens.json", "utf-8");
		const tokens = JSON.parse(data);
		const result = await refreshAccessToken(tokens.refresh_token);

		console.log("Token atualizado com sucesso!");

		await fs.writeFile("tokens.json", JSON.stringify(result));

		console.log("Novo Access Token:", result.access_token);
	} catch (error) {
		throw new Error(
			"Erro ao renovar o token. Certifique-se de que o token foi gerado corretamente.",
		);
	}
}
