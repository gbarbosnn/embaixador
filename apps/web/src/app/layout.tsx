import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const font = Montserrat({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Embaixadores - Jolimont",
	description: "Embaixadores - App",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="pt-BR">
			<body className={`${font.className} antialiased`}>{children}</body>
		</html>
	);
}
