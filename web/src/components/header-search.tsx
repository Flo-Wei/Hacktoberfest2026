"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";
import { cn } from "cn";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";

type HeaderSearchProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HeaderSearch({ open, onOpenChange }: HeaderSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");

  function expand() {
    onOpenChange(true);
    inputRef.current?.focus();
  }

  function close() {
    onOpenChange(false);
    setQuery("");
    toggleRef.current?.focus();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;
    router.push(`/info?q=${encodeURIComponent(text)}`);
    close();
  }

  return (
    <form role="search" onSubmit={submit} className={cn("flex justify-end", open && "max-md:flex-1")}>
      <InputGroup
        className={cn(
          "h-11 transition-[width,border-color] duration-200 ease-out md:h-9",
          open ? "w-full overflow-clip md:w-60" : "w-11 border-transparent bg-transparent md:w-9",
        )}
      >
        <InputGroupAddon className={cn(!open && "p-0 has-[>button]:ml-0")}>
          <InputGroupButton
            ref={toggleRef}
            size="icon-sm"
            aria-label="Open search"
            aria-expanded={open}
            tabIndex={open ? -1 : 0}
            className={cn("rounded-full", open ? "pointer-events-none size-6" : "size-11 md:size-9")}
            onClick={expand}
          >
            <SearchIcon />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === "Escape" && close()}
          placeholder="Search offers"
          aria-label="Search offers"
          tabIndex={open ? 0 : -1}
          className={cn("text-sm", !open && "w-0 flex-none px-0")}
        />
        {open && (
          <InputGroupAddon align="inline-end">
            <Kbd className="max-md:hidden">Esc</Kbd>
            <InputGroupButton
              size="icon-xs"
              aria-label="Close search"
              className="max-md:size-11"
              onClick={close}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </form>
  );
}
