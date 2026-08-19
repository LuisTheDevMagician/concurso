import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { THEME_COOKIE, getTheme, themeToCssVars } from "@/lib/themes";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Concursos",
  description: "Acompanhamento de estudos para concursos.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const theme = getTheme(cookieStore.get(THEME_COOKIE)?.value);
  const themeStyle = themeToCssVars(theme.tokens) as CSSProperties;

  return (
    <html
      lang="pt-BR"
      data-theme={theme.id}
      className={`dark ${fraunces.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
      style={themeStyle}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
          {children}
        </main>
        <ThemeSwitcher initial={theme.id} />
      </body>
    </html>
  );
}
