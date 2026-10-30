"use client";

import { usePathname } from "next/navigation";
import { LeafIcon } from "lucide-react";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname === "/chat") return null;

  return (
    <footer className="mx-auto w-full max-w-[82rem] px-5 pb-6 text-xs text-muted-foreground md:px-7">
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t pt-[18px]">
        <span>© Grabby · A little companion for everyday shopping.</span>
        <span className="flex items-center gap-1.5">
          <a
            href="https://github.com/Flo-Wei/Hacktoberfest2026"
            className="underline underline-offset-4 transition-colors duration-200 hover:text-foreground"
          >
            Grabby is open source
          </a>
          <span aria-hidden>·</span>
          Sample prices
          <LeafIcon aria-hidden className="size-3" />
        </span>
      </div>
    </footer>
  );
}
