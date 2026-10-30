"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { Crab } from "@/components/crab";
import { HeaderSearch } from "@/components/header-search";
import { ProfileMenu } from "@/components/profile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { NAV, NAV_HIDDEN_ON } from "@/lib/nav";

// Search takes over the bar on phones, so its neighbours fade and collapse.
const COLLAPSED_ON_PHONE = "max-md:invisible max-md:max-w-0 max-md:overflow-hidden max-md:opacity-0";

function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex items-center gap-1">
      {NAV.map(({ href, label, icon: Icon, primary }) => (
        <Button
          key={href}
          asChild
          size="sm"
          variant="nav"
          data-primary={primary || undefined}
          className="rounded-lg lg:h-10 lg:has-[>svg]:px-4"
        >
          <Link href={href} aria-current={pathname === href ? "page" : undefined}>
            <Icon data-icon="inline-start" />
            {label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}

type SiteHeaderProps = { userName: string | null; userAvatar: string | null };

export function SiteHeader({ userName, userAvatar }: SiteHeaderProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const showNav = userName && pathname !== NAV_HIDDEN_ON;

  return (
    <header className="sticky top-0 z-40 border-b bg-[var(--glass)] backdrop-blur-lg">
      <div className="mx-auto flex h-[var(--header-height)] max-w-[82rem] items-center justify-between gap-2 px-5 md:px-7">
        <Link
          href={userName ? "/" : "/onboarding"}
          className={cn(
            "flex max-w-40 items-center gap-[9px] rounded-sm text-[23px] font-semibold tracking-tight no-underline outline-none transition-[max-width,opacity,visibility] duration-200 ease-out focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-[25px]",
            searchOpen && COLLAPSED_ON_PHONE,
          )}
        >
          <Crab size={36} walkOnHover />
          <span>
            Grabby<span className="text-primary">.</span>
          </span>
        </Link>
        {showNav && (
          <div className="hidden md:block">
            <MainNav />
          </div>
        )}

        <div className={cn("flex items-center gap-1 md:gap-3.5", searchOpen && "max-md:flex-1")}>
          {showNav && <HeaderSearch open={searchOpen} onOpenChange={setSearchOpen} />}
          <div
            className={cn(
              "flex max-w-56 items-center gap-1 transition-[max-width,opacity,visibility] duration-200 ease-out md:gap-3.5",
              searchOpen && COLLAPSED_ON_PHONE,
            )}
          >
            <ThemeToggle />
            {userName && <div aria-hidden className="hidden h-[22px] w-px bg-border md:block" />}
            <ProfileMenu name={userName} avatar={userAvatar} />
          </div>
        </div>
      </div>
    </header>
  );
}
