import { env } from "@/env";
import puppeteer from "puppeteer";
import axios from "axios";
import qs from "qs";
import fs from "node:fs/promises";

const clientId = env.BLING_API_CLIENT_ID;
const clientSecret = env.BLING_API_CLIENT_SECRET;
const redirectUri = "https://www.vinhosjolimont.com.br/";
const state = "42";
const user = env.BLING_USER;
const password = env.BLING_PASSWORD;

const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&state=${state}&redirect_uri=${redirectUri}`;

export async function authenticateWithBling(): Promise<void> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        await page.goto(authUrl);

        await page.type('input[name="login"]', user);
        await page.type('input[name="password"]', password);
        await page.click(".bling-button.call-to-action");

        await page.waitForNavigation({ waitUntil: "networkidle0" });

        const authorizationButton = await page.$('button.Button.Button--primary[name="authorized"]');
        
        if (authorizationButton) {
            console.log("Botão de autorização encontrado. Clicando...");
            await authorizationButton.click();
            await page.waitForNavigation({ waitUntil: "networkidle0" });
        } else {
            console.log("Botão de autorização não encontrado. Continuando sem clicar...");
        }

        const currentUrl = page.url();
        console.log('Página atual: ', currentUrl);

        const authCode = extractCodeFromURL(currentUrl);

        if (!authCode) {
            throw new Error("Authorization code not found");
        }

        console.log("Authorization Code:", authCode);

        const tokenData = await getAccessToken(authCode);
        console.log("Access Token:", tokenData.access_token);
        console.log("Refresh Token:", tokenData.refresh_token);

        await fs.writeFile("tokens.json", JSON.stringify(tokenData));

    } catch (error) {
        console.error("Erro durante a autenticação:", error);
    } finally {
        await browser.close();
    }
}


function extractCodeFromURL(url: string): string | null {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get("code");
}

interface TokenData {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: string;
}

async function getAccessToken(authCode: string): Promise<TokenData> {
	const tokenUrl = "https://www.bling.com.br/Api/v3/oauth/token";
	const base64Creds = Buffer.from(`${clientId}:${clientSecret}`).toString(
		"base64",
	);

	const data = qs.stringify({
		grant_type: "authorization_code",
		code: authCode,
		redirect_uri: redirectUri,
	});

	const headers = {
		Authorization: `Basic ${base64Creds}`,
		"Content-Type": "application/x-www-form-urlencoded",
	};

	const response = await axios.post(tokenUrl, data, { headers });
	return response.data;
}

export async function refreshAccessToken(
	refreshToken: string,
): Promise<TokenData> {
	const tokenUrl = "https://www.bling.com.br/Api/v3/oauth/token";
	const base64Creds = Buffer.from(`${clientId}:${clientSecret}`).toString(
		"base64",
	);

	const data = qs.stringify({
		grant_type: "refresh_token",
		refresh_token: refreshToken,
	});

	const headers = {
		Authorization: `Basic ${base64Creds}`,
		"Content-Type": "application/x-www-form-urlencoded",
	};

	try {
		const response = await axios.post(tokenUrl, data, { headers });
		return response.data;
	} catch (error) {
		const err = error as axios.AxiosError;
		console.error(
			"Error refreshing token:",
			err.response ? err.response.data : err.message,
		);
		throw err;
	}
}
