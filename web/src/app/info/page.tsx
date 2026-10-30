import { OffCredit } from "@/components/off-credit";
import { listOffers } from "@/lib/offers";
import { requireUser } from "@/lib/session";
import { OfferBoard } from "./offer-board";

export default async function InfoPage() {
  const user = await requireUser();
  const offers = await listOffers(user.city);

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
