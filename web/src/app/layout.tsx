import type { Metadata } from "next";
import Link from "next/link";
import { KrabbyPopup } from "@/components/krabby-popup";
import { KrabbySession } from "@/components/krabby-session";
import { getCurrentUser } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grabby",
  description: "Food recommendations from discounts, your profile and similar users",
};

const NAV = [
  { href: "/swipe", label: "Swipe" },
  { href: "/chat", label: "Chat" },
  { href: "/list", label: "List" },
  { href: "/info", label: "Info" },
];

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="mx-auto flex min-h-dvh max-w-md flex-col">
        <header className="flex items-center justify-between px-4 py-3">
          <Link href={user ? "/" : "/onboarding"} className="text-xl font-bold text-orange-600">
            Grabby
          </Link>
          {user && (
            <Link href="/personas" className="text-sm text-stone-600 underline">
              {user.name}
            </Link>
          )}
        </header>
        <main className="flex-1 px-4 pb-6">{children}</main>
        {user && <KrabbySession />}
        {user && <KrabbyPopup />}
        {user && (
          <nav className="sticky bottom-0 grid grid-cols-4 border-t border-orange-200 bg-white">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-3 text-center font-medium hover:bg-orange-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </body>
    </html>
  );
}
