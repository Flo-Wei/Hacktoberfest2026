import type { CSSProperties } from "react";
import { cn } from "cn";

type CrabProps = {
  size?: number;
  walking?: boolean;
  walkOnHover?: boolean;
  className?: string;
};

export function Crab({ size = 32, walking, walkOnHover, className }: CrabProps) {
  return (
    <span
      aria-hidden
      data-walking={walking || undefined}
      data-walk-on-hover={walkOnHover || undefined}
      className={cn("crab", className)}
      style={{ "--crab-size": `${size}px` } as CSSProperties}
    />
  );
}

export function CrabWalk({ size = 88, className }: { size?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("crab-track", className)}>
      <Crab size={size} />
    </div>
  );
}
