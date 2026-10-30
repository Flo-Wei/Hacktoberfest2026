import Link from "next/link";
import { HeartIcon, TagIcon } from "lucide-react";
import { Crab } from "@/components/crab";
import { formatPrice } from "@/lib/format";
import type { RecommendedProduct } from "@/lib/products";

// Phones keep the stack, peeking out past the hero's right edge.
const PLACEMENT =
  "relative flex w-[45%] items-center justify-center self-stretch max-[830px]:hidden max-[600px]:absolute max-[600px]:top-[74px] max-[600px]:right-[-51px] max-[600px]:flex max-[600px]:h-[220px] max-[600px]:w-[35%] max-[600px]:rotate-[8deg] max-[600px]:opacity-80 max-[360px]:right-[-62px] max-[360px]:opacity-60";

export function HeroOffer({ product }: { product: RecommendedProduct }) {
  return (
    <div className={PLACEMENT}>
      <div className="offer-stack">
        <div className="offer-back" data-side="left" />
        <div className="offer-back" />
        <Link
          href="/swipe"
          className="offer-card w-[202px] p-[11px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 max-[1050px]:w-[165px] max-[600px]:w-[132px] max-[600px]:p-2 min-[1450px]:w-[218px]"
        >
          <div className="relative flex h-[165px] items-center justify-center rounded-xl bg-secondary p-3 max-[1050px]:h-[142px] max-[600px]:h-[111px] min-[1450px]:h-[180px]">
            <span className="absolute top-2 left-2 rounded-md bg-card/80 px-1.5 py-0.5 text-xs font-medium">
              Sample prices
            </span>
            <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-card/70 text-selected-foreground max-[600px]:hidden">
              <HeartIcon aria-hidden className="size-3.5" />
            </span>
            {product.image_url ? (
              // External store links, so next/image would need every host configured.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt="" className="max-h-full max-w-full rounded-md object-contain" />
            ) : (
              <Crab size={64} />
            )}
          </div>
          <div className="flex flex-col gap-0.5 px-[3px] pt-2.5 pb-px">
            <span className="truncate text-xs font-semibold tracking-[1.6px] text-muted-foreground uppercase">
              {product.store}
            </span>
            <h3 className="line-clamp-2 text-sm font-semibold max-[600px]:text-xs">{product.name}</h3>
            <p className="flex items-baseline gap-1.5 tabular-nums">
              <span className="text-[19px] font-semibold tracking-[-0.7px] text-selected-foreground max-[600px]:text-base">
                {formatPrice(product.discount_cents)}
              </span>
              <del className="text-xs text-muted-foreground">{formatPrice(product.regular_cents)}</del>
            </p>
            <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <TagIcon aria-hidden className="size-3 shrink-0" />
              <span className="truncate">{product.category}</span>
            </span>
          </div>
        </Link>
        <div
          aria-hidden
          className="absolute -bottom-9 -left-8 z-10 flex -rotate-[4deg] items-center gap-1.5 rounded-[10px] border border-[var(--glass-edge)] bg-card/85 px-3 py-2 text-xs whitespace-nowrap shadow-[var(--shadow-soft)] max-[600px]:hidden"
        >
          <HeartIcon className="size-3.5 text-selected-foreground" />
          More of what you love.
        </div>
      </div>
    </div>
  );
}
