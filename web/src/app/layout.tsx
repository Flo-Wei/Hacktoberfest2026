import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { BottomNav } from "@/components/bottom-nav";
import { KrabbyPopup } from "@/components/krabby-popup";
import { KrabbySession } from "@/components/krabby-session";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";
// The optical size axis gives headings Inter's tighter display cut automatically.
import "@fontsource-variable/inter/opsz.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grabby",
  description: "Food recommendations from discounts, your profile and similar users",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader userName={user?.name ?? null} userAvatar={user?.avatar ?? null} />
          <main className="mx-auto flex w-full max-w-[82rem] flex-1 flex-col px-5 pt-[38px] pb-5 md:px-7">{children}</main>
          <SiteFooter />
          {user && <KrabbySession />}
          {user && <KrabbyPopup />}
          {user && <BottomNav />}
        </ThemeProvider>
      </body>
    </html>
  );
}
