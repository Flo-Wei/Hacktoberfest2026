"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const KEY = "krabby-session";

// sessionStorage is empty when the app is opened fresh, so that starts a new chat.
export function KrabbySession() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let fresh = false;
    try {
      fresh = !sessionStorage.getItem(KEY);
      sessionStorage.setItem(KEY, "1");
    } catch {
      return;
    }
    if (!fresh) return;
    void fetch("/api/chats/new", { method: "POST" }).then(() => {
      if (pathname === "/chat") router.refresh();
    });
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
