import fs from "node:fs/promises";
import { authenticateWithBling } from "./auth";

export async function getAccessToken(): Promise<string> {
    try {
        await fs.access("tokens.json");

        const data = await fs.readFile("tokens.json", "utf-8");
        const tokens = JSON.parse(data);
        return tokens.access_token;

    } catch (error) {
        await authenticateWithBling();

        try {
            const data = await fs.readFile("tokens.json", "utf-8");
            const tokens = JSON.parse(data);
            return tokens.access_token;
        } catch (err) {
            throw new Error("Erro ao ler o arquivo de tokens após autenticação.");
        }
    }
}
