import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const socialImage = new URL("og.jpg", siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`).toString();

export const metadata: Metadata = {
  title: "Mieszko Mahboob",
  description: "Sound director, Creative Leader i twórca projektów AI. Warszawa.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: `${basePath}/brand/zgrywa-symbol.svg`,
  },
  openGraph: {
    title: "Mieszko Mahboob",
    description: "Sound director, Creative Leader i twórca projektów AI. Warszawa.",
    type: "website",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "Mieszko Mahboob",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mieszko Mahboob",
    description: "Sound director, Creative Leader i twórca projektów AI. Warszawa.",
    images: [socialImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
