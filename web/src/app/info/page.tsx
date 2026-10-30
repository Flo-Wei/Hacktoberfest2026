import Link from "next/link";
import { FeaturePanel } from "@/components/feature-panel";
import { OffCredit } from "@/components/off-credit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listOffers, type Offer } from "@/lib/products";
import { requireUser } from "@/lib/session";
import { OfferBoard } from "./offer-board";

type InfoPageProps = { searchParams: Promise<{ q?: string }> };

function matches(offer: Offer, search: string) {
  return [offer.name, offer.store, offer.category, ...offer.tags].some((text) =>
    text.toLowerCase().includes(search),
  );
}

export default async function InfoPage({ searchParams }: InfoPageProps) {
  await requireUser();
  const { q } = await searchParams;
  const search = q?.trim().toLowerCase();
  const allOffers = await listOffers();
  const offers = search ? allOffers.filter((offer) => matches(offer, search)) : allOffers;

  if (offers.length === 0) {
    return (
      <FeaturePanel
        title={q ? `No results for “${q}”` : "No offers here yet"}
        text={q ? "Try another product, store or category." : "New offers are on their way."}
      >
        <Button asChild>
          <Link href={q ? "/info" : "/swipe"}>{q ? "Show all offers" : "Start swiping"}</Link>
        </Button>
      </FeaturePanel>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Info board</h1>
          <p className="text-sm text-muted-foreground max-sm:hidden">
            {q ? `Results for “${q}”` : "All current offers by store."}
          </p>
        </div>
        <Badge variant="outline">Sample prices</Badge>
      </div>
      <OfferBoard key={search} offers={offers} />
      <OffCredit />
    </div>
  );
}
