import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  DumbbellIcon,
  LayersIcon,
  LeafIcon,
  MapPinIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TargetIcon,
} from "lucide-react";
import { Crab } from "@/components/crab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { recommendProducts, type RecommendedProduct } from "@/lib/products";
import { requireUser } from "@/lib/session";
import { HeroOffer } from "./home/hero-offer";
import { KrabbyPanel } from "./home/krabby-panel";

// The first pick leads the hero, the rest fill Top picks.
const PICK_COUNT = 4;

const FITNESS_GOALS = ["Fitness", "Build muscle"];

const STEPS = [
  {
    title: "Made around you",
    text: "Your goals and preferences set the direction.",
    icon: TargetIcon,
    tone: "text-muted-foreground",
  },
  {
    title: "Swipe into something good",
    text: "Explore offers, one little discovery at a time.",
    icon: LayersIcon,
    tone: "text-foreground/70",
  },
  {
    title: "Keep your favourites close",
    text: "Save the finds you'd love to take home.",
    icon: ShoppingBagIcon,
    tone: "text-selected-foreground",
  },
];

type PreferenceGroupProps = {
  title: string;
  icon: React.ReactNode;
  items: string[];
  variant: "selected" | "secondary";
  itemIcon: (item: string) => React.ReactNode;
};

function PreferenceGroup({ title, icon, items, variant, itemIcon }: PreferenceGroupProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="flex items-center gap-[7px] text-xs font-normal text-muted-foreground">
        {icon}
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing selected yet</p>}
        {items.map((item) => (
          <Badge key={item} variant={variant} className="rounded-[7px] px-2.5 py-1.5 text-xs font-normal">
            {itemIcon(item)}
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function Pick({ product }: { product: RecommendedProduct }) {
  return (
    <Link
      href="/swipe"
      className="glass flex h-full overflow-hidden rounded-[19px] no-underline outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:hover:translate-y-0 sm:flex-col"
    >
      <div className="flex w-28 shrink-0 items-center justify-center bg-secondary p-3 sm:h-44 sm:w-auto sm:p-4">
        {product.image_url ? (
          // External store links, so next/image would need every host configured.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt="" className="max-h-20 max-w-full rounded-md object-contain sm:max-h-full" />
        ) : (
          <Crab size={64} />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-4">
        <p className="text-sm text-muted-foreground">{product.store}</p>
        <h3 className="font-medium text-pretty">{product.name}</h3>
        <p className="mt-auto flex items-baseline gap-2 pt-2 tabular-nums">
          <span className="text-xl font-semibold text-selected-foreground">
            {formatPrice(product.discount_cents)}
          </span>
          <del className="text-sm text-muted-foreground">{formatPrice(product.regular_cents)}</del>
        </p>
      </div>
    </Link>
  );
}

export default async function Home() {
  const user = await requireUser();
  const picks = await recommendProducts(user, PICK_COUNT);
  const [lead, ...others] = picks;

  return (
    <div className="flex flex-1 flex-col">
      <section
        aria-label="Welcome"
        className="relative mb-7 flex items-center justify-between gap-4 max-[600px]:mb-[23px] max-[600px]:items-start max-[600px]:pt-3"
      >
        <div className="min-w-0 max-[600px]:w-full">
          <p className="text-xs font-semibold tracking-[2.1px] text-muted-foreground uppercase max-[600px]:pr-32 max-[600px]:tracking-[1.2px]">
            A little less searching. More good finds.
          </p>
          <h1 className="mt-[7px] mb-1.5 text-[36px] leading-[1.25] font-[450] tracking-[-1.25px] text-balance wrap-anywhere max-[600px]:text-[29px] max-[600px]:tracking-[-1.1px] max-[360px]:text-[26px]">
            Good to see you, <span className="text-selected-foreground">{user.name.split(" ")[0]}.</span>
          </h1>
          <p className="text-sm text-muted-foreground">Let&apos;s find something that feels right for you.</p>
        </div>
        <div className="glass flex shrink-0 items-center gap-[7px] rounded-[30px] px-[15px] py-[9px] text-xs text-muted-foreground max-[600px]:absolute max-[600px]:top-0 max-[600px]:right-0 max-[600px]:gap-1 max-[600px]:px-2 max-[600px]:py-1.5">
          <MapPinIcon aria-hidden className="size-[15px] max-[600px]:size-3" />
          {user.city}, AT
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-[22px] max-[1050px]:grid-cols-[minmax(0,1fr)_285px] max-[1050px]:gap-[17px] max-[830px]:grid-cols-[minmax(0,1fr)_260px] max-[600px]:grid-cols-1 max-[600px]:gap-4">
        <section
          aria-labelledby="hero-title"
          className="hero-panel flex min-h-[398px] items-center rounded-[28px] p-[38px] max-[1050px]:min-h-[390px] max-[1050px]:p-[27px] max-[830px]:min-h-[410px] max-[830px]:p-[26px] max-[600px]:min-h-[356px] max-[600px]:rounded-[23px] max-[600px]:p-7 max-[360px]:p-6 min-[1450px]:min-h-[430px]"
        >
          <div className="relative z-10 w-[55%] max-[830px]:w-full max-[600px]:w-[84%]">
            <p className="inline-flex items-center gap-[7px] rounded-[20px] border border-[var(--glass-edge)] bg-card/50 px-[11px] py-1.5 text-xs font-semibold tracking-[0.5px] text-foreground/80 max-[600px]:tracking-[0.3px]">
              <SparklesIcon aria-hidden className="size-[13px] shrink-0" />
              YOUR TASTE. YOUR KIND OF FINDS.
            </p>
            <h2
              id="hero-title"
              className="mt-5 mb-[17px] text-[43px] leading-[1.13] font-[480] tracking-[-1.8px] max-[1050px]:text-[36px] max-[830px]:text-[39px] max-[600px]:mt-[18px] max-[600px]:mb-3.5 max-[600px]:text-[34px] max-[600px]:tracking-[-1.4px] max-[360px]:text-[29px] min-[1450px]:text-[48px]"
            >
              Good food.
              <br />
              Great finds.
              <br />
              <span className="whitespace-nowrap text-selected-foreground">Made for you.</span>
            </h2>
            <p className="mb-6 max-w-60 text-sm leading-[1.8] text-foreground/80 max-[830px]:max-w-[260px] max-[600px]:max-w-[185px] max-[600px]:leading-[1.7]">
              Supermarket offers that fit your goals, your plate, and your everyday.
            </p>
            <Button asChild className="gap-[18px] rounded-lg has-[>svg]:px-[18px]">
              <Link href="/swipe">
                Start swiping
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <p className="mt-3.5 flex items-center gap-1.5 text-xs text-foreground/80">
              <CheckIcon aria-hidden className="size-3 shrink-0" />
              A little swipe. A delicious possibility.
            </p>
          </div>
          {lead && <HeroOffer product={lead} />}
        </section>

        <aside
          aria-labelledby="dna-title"
          className="glass flex flex-col rounded-[26px] p-[25px] max-[1050px]:p-[22px] max-[600px]:rounded-[23px]"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 id="dna-title" className="text-[17px] font-[580] tracking-[-0.5px]">
              Your shopping DNA
            </h2>
            <Badge variant="secondary">Soon</Badge>
          </div>
          <p className="mt-[5px] text-xs text-muted-foreground">Good finds start with what matters to you.</p>
          <p className="mt-2 mb-[23px] flex flex-wrap items-center gap-2 text-xs text-muted-foreground max-[600px]:mb-[19px]">
            {user.age} years old, {user.city}
            {user.is_mock && <Badge variant="outline">Test profile</Badge>}
          </p>
          <div className="grid gap-5 max-[600px]:grid-cols-2 max-[600px]:gap-4 max-[360px]:grid-cols-1">
            <PreferenceGroup
              title="Your goals"
              icon={<TargetIcon aria-hidden className="size-3.5" />}
              items={user.goals}
              variant="selected"
              itemIcon={(goal) => (FITNESS_GOALS.includes(goal) ? <DumbbellIcon aria-hidden /> : <TargetIcon aria-hidden />)}
            />
            <div className="border-t pt-5 max-[600px]:border-0 max-[600px]:pt-0">
              <PreferenceGroup
                title="On your plate"
                icon={<LeafIcon aria-hidden className="size-3.5" />}
                items={user.preferences}
                variant="secondary"
                itemIcon={() => <LeafIcon aria-hidden />}
              />
            </div>
          </div>
          <p className="mt-auto flex items-start gap-[7px] pt-5 text-xs text-muted-foreground max-[600px]:pt-[17px]">
            <SparklesIcon aria-hidden className="mt-px size-[13px] shrink-0" />
            <span>
              A small reflection of you.
              <br />
              You can change these soon.
            </span>
          </p>
        </aside>

        <KrabbyPanel />
      </div>

      {picks.length !== 1 && (
        <section aria-labelledby="picks" className="mt-[27px] flex flex-col gap-[13px]">
          <div className="flex items-center justify-between gap-2">
            <h2 id="picks" className="text-[17px] font-[550] tracking-[-0.4px]">
              Top picks for you
            </h2>
            <Badge variant="outline">Sample prices</Badge>
          </div>
          {picks.length === 0 ? (
            <p className="text-muted-foreground">You&apos;ve swiped all the offers.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-3">
              {others.map((product) => (
                <li key={product.id}>
                  <Pick product={product} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="mt-[27px] mb-[13px] flex items-center justify-between gap-4 max-[600px]:mt-[25px] max-[600px]:mb-[5px]">
        <h2 className="text-[17px] font-[550] tracking-[-0.4px] max-[600px]:text-base">
          Good finds. A few swipes away.
        </h2>
        <p className="text-xs text-muted-foreground max-[830px]:hidden">Shopping, with a little more intention.</p>
      </div>
      <section
        aria-label="How Grabby works"
        className="grid grid-cols-3 gap-[18px] max-[830px]:gap-3 max-[600px]:grid-cols-1 max-[600px]:gap-0"
      >
        {STEPS.map(({ title, text, icon: Icon, tone }) => (
          <div
            key={title}
            className="flex items-center gap-3 py-3 max-[830px]:items-start max-[600px]:items-center max-[600px]:py-[11px] max-[600px]:not-first:border-t"
          >
            <div className="grid size-[38px] shrink-0 place-items-center rounded-xl border bg-card/40 max-[830px]:size-[30px] max-[600px]:size-[34px]">
              <Icon aria-hidden className={`size-5 ${tone} max-[830px]:size-4`} />
            </div>
            <div className="min-w-0">
              <strong className="text-sm font-semibold">{title}</strong>
              <p className="text-xs text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
