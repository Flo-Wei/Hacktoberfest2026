import { OffCredit } from "@/components/off-credit";
import { searchOffers } from "@/lib/products";
import { requireUser } from "@/lib/session";
import { OfferBoard } from "./offer-board";

const MAX_OFFERS = 1000;

export default async function InfoPage() {
  const user = await requireUser();
  const offers = await searchOffers(user.city, {}, MAX_OFFERS);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Info board</h1>
        <p className="text-sm text-stone-600">All current offers by store. Prices are mock data.</p>
      </div>
      <OfferBoard offers={offers} />
      <OffCredit />
    </div>
  );
}
