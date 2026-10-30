import { OffCredit } from "@/components/off-credit";
import { listOffers } from "@/lib/products";
import { requireUser } from "@/lib/session";
import { OfferBoard } from "./offer-board";

export default async function InfoPage() {
  await requireUser();
  const offers = await listOffers();

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
