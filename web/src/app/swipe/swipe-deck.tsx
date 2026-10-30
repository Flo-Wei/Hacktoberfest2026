"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CircleAlertIcon, HeartIcon, TagIcon, UserCheckIcon, UsersIcon, XIcon } from "lucide-react";
import { cn } from "cn";
import { recordSwipe } from "@/app/actions";
import { FeaturePanel } from "@/components/feature-panel";
import { ProductImage } from "@/components/product-image";
import { Toast } from "@/components/toast";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { discountPercent, formatPrice } from "@/lib/format";
import { reportAppEvent } from "@/lib/krabby/events";
import type { RecommendedProduct } from "@/lib/products";

const THRESHOLD = 100;
const EXIT_MS = 200;
const TOAST_MS = 2400;
// Keys typed here belong to the field or menu, not the deck.
const KEY_IGNORED_IN = "input, textarea, [contenteditable], [role=menu]";

const REASONS = {
  similar: { text: "Liked by similar users", icon: UsersIcon },
  profile: { text: "Matches your profile", icon: UserCheckIcon },
  offer: { text: "Good offer", icon: TagIcon },
};

type SwipeDeckProps = { products: RecommendedProduct[]; children: React.ReactNode };

// The last like of a batch refreshes the products and remounts the deck, so the
// toast lives out here to survive that.
export function SwipeDeck({ products, children }: SwipeDeckProps) {
  const [saved, setSaved] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showSaved() {
    clearTimeout(toastTimer.current);
    setSaved(true);
    toastTimer.current = setTimeout(() => setSaved(false), TOAST_MS);
  }

  return (
    <>
      <Deck key={products.map((product) => product.id).join()} products={products} onLike={showSaved}>
        {children}
      </Deck>
      <Toast message="A good find, saved." open={saved} />
    </>
  );
}

function Deck({ products, onLike, children }: SwipeDeckProps & { onLike: () => void }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startX = useRef(0);
  const swipeRef = useRef(swipe);

  const product = products[index];

  useEffect(() => {
    swipeRef.current = swipe;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.target instanceof Element && event.target.closest(KEY_IGNORED_IN)) return;
      event.preventDefault();
      void swipeRef.current(event.key === "ArrowRight");
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function swipe(liked: boolean) {
    if (leaving || !product) return;
    setLeaving(true);
    setDragging(false);
    setOffset(liked ? 500 : -500);
    setError(null);

    const saved = recordSwipe(product.id, liked);
    await new Promise((resolve) => setTimeout(resolve, EXIT_MS));
    try {
      await saved;
    } catch {
      setError("Couldn't save that. Please try again.");
      setOffset(0);
      setLeaving(false);
      return;
    }

    if (liked) onLike();
    reportAppEvent({ type: "swipe", productId: product.id, liked });
    setOffset(0);
    setLeaving(false);
    setIndex(index + 1);
    // Rank the next batch with the swipes from this one.
    if (index + 1 === products.length) router.refresh();
  }

  if (!product) {
    if (products.length > 0) return <Skeleton className="min-h-96 flex-1 rounded-xl" />;

    return (
      <>
        <FeaturePanel heading="h2" title="You've swiped all the offers" text="Krabby is happy to chat while new ones arrive.">
          <Button asChild>
            <Link href="/chat">Chat with Krabby</Link>
          </Button>
        </FeaturePanel>
        {children}
      </>
    );
  }

  const percent = discountPercent(product);
  const { text: reason, icon: ReasonIcon } = REASONS[product.reason];

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(offset) >= THRESHOLD) void swipe(offset > 0);
    else setOffset(0);
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div
        onPointerDown={(event) => {
          if (leaving) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          startX.current = event.clientX;
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (dragging) setOffset(event.clientX - startX.current);
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          setDragging(false);
          setOffset(0);
        }}
        style={{
          transform: `translateX(${offset}px) rotate(${offset / 20}deg)`,
          opacity: leaving ? 0 : 1,
          transition: dragging ? "none" : `transform ${EXIT_MS}ms ease-out, opacity ${EXIT_MS}ms ease-out`,
        }}
        className={cn(
          "glass relative grid flex-1 cursor-grab touch-none overflow-hidden rounded-[26px] select-none active:cursor-grabbing md:grid-cols-2",
          dragging && "shadow-lg",
        )}
      >
        <ProductImage
          key={product.id}
          product={product}
          className="h-36 p-3 md:h-full md:min-h-96 md:p-8 md:[&_img]:max-h-[26rem]"
        />
        <div className="flex flex-col justify-center gap-4 p-4 md:gap-5 lg:p-12">
          <div className="flex flex-col items-start gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {product.store}
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-balance lg:text-3xl">{product.name}</h2>
            <p className="text-sm text-muted-foreground">
              {product.unit} · {product.category}
            </p>
          </div>
          <p className="flex items-center gap-2 tabular-nums">
            <span className="text-[28px] font-semibold tracking-tight text-selected-foreground">
              {formatPrice(product.discount_cents)}
            </span>
            <del className="text-muted-foreground">{formatPrice(product.regular_cents)}</del>
            <Badge variant="selected" className="ml-1 px-3 py-1 text-sm normal-nums">
              −{percent}%
            </Badge>
          </p>
          {product.kcal !== null && (
            <dl className="grid grid-cols-4 gap-2 border-y py-3 text-sm">
              {[
                ["kcal", product.kcal],
                ["Protein", `${product.protein_g} g`],
                ["Carbs", `${product.carbs_g} g`],
                ["Fat", `${product.fat_g} g`],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="flex items-center gap-2 text-sm font-medium">
            <ReasonIcon aria-hidden className="size-4 text-muted-foreground" />
            {reason}
          </p>
          {product.off_code && (
            <a
              href={`https://world.openfoodfacts.org/product/${product.off_code}`}
              target="_blank"
              rel="noreferrer"
              onPointerDown={(event) => event.stopPropagation()}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Image and nutrition per 100 g/ml: Open Food Facts (example product)
            </a>
          )}
        </div>
        {offset !== 0 && !leaving && (
          <span
            aria-hidden
            className={cn(
              "absolute top-4 left-4 rounded-full border bg-card px-3 py-1 text-sm font-semibold shadow-sm",
              offset > 0 ? "text-success" : "text-destructive",
            )}
          >
            {offset > 0 ? "Like" : "No thanks"}
          </span>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle className="line-clamp-none">{error}</AlertTitle>
        </Alert>
      )}
      <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="max-md:order-last">{children}</div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-center gap-4">
            <button
              type="button"
              className="round-action"
              aria-label="No thanks"
              disabled={leaving}
              onClick={() => swipe(false)}
            >
              <XIcon aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              className="round-action"
              data-variant="save"
              aria-label="Like"
              disabled={leaving}
              onClick={() => swipe(true)}
            >
              <HeartIcon aria-hidden className="size-5" />
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Skip or save · swipe left or right · use ← or →
          </p>
        </div>
      </div>
    </div>
  );
}
