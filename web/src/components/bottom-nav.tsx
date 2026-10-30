"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { NAV, NAV_HIDDEN_ON } from "@/lib/nav";

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === NAV_HIDDEN_ON) return null;

  return (
    <>
      <div aria-hidden className="h-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] md:hidden" />
      <nav
        aria-label="Main navigation"
        className="glass fixed inset-x-4 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 grid grid-cols-5 gap-[3px] rounded-[19px] bg-card/90 p-[7px] backdrop-blur-xl md:hidden"
      >
        {NAV.map(({ href, label, icon: Icon, primary }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-[3px] rounded-[13px] px-1 py-[7px] text-xs font-medium text-muted-foreground no-underline outline-none transition-colors duration-200",
              "focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-selected aria-[current=page]:text-selected-foreground",
              primary && "not-aria-[current=page]:text-foreground",
            )}
          >
            <Icon aria-hidden className={cn("size-5", primary && "text-primary")} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
