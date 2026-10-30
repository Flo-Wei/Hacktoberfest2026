"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, LogOutIcon, RepeatIcon, UserIcon } from "lucide-react";
import { logout } from "@/app/actions";
import { NAV_HIDDEN_ON } from "@/lib/nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function ProfileMenu({ name, avatar }: { name: string | null; avatar: string | null }) {
  const pathname = usePathname();

  if (!name) {
    if (pathname === NAV_HIDDEN_ON) return null;

    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/onboarding">Create account</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Profile menu"
          className="size-11 gap-2 rounded-full p-0 has-[>svg]:p-0 sm:h-11 sm:w-auto sm:pr-2"
        >
          <Avatar className="size-[38px] border-[3px] border-card">
            {avatar && <AvatarImage src={avatar} alt="" />}
            <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
          </Avatar>
          <ChevronDownIcon aria-hidden className="size-3.5 text-muted-foreground max-sm:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/">
              <UserIcon />
              Your profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/personas">
              <RepeatIcon />
              Switch test profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={logout}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOutIcon />
              Log out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
