import { Placeholder } from "@/components/placeholder";
import { requireUser } from "@/lib/session";

export default async function InfoPage() {
  await requireUser();
  return <Placeholder title="Infoboard" text="Hier siehst du, welche Angebote es in welchem Laden in deiner Nähe gibt." />;
}
