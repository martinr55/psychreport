import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "latin-ext"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Cognitive Report App",
  description:
    "Clinical workspace for drafting WAIS cognitive assessment reports.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="et"
      suppressHydrationWarning
      className={`${sourceSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
