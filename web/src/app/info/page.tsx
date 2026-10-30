import { Placeholder } from "@/components/placeholder";
import { requireUser } from "@/lib/session";

export default async function InfoPage() {
  await requireUser();
  return <Placeholder title="Info board" text="See which offers are available in which store near you." />;
}
