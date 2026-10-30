import Link from "next/link";
import { OnboardingForm } from "./onboarding-form";

export default function OnboardingPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Willkommen bei Grabby</h1>
        <p className="text-stone-600">Ein paar kurze Infos, dann geht es los.</p>
      </div>
      <OnboardingForm />
      <p className="text-center text-sm">
        <Link href="/personas" className="text-stone-600 underline">
          Oder eine Mock-Person verwenden
        </Link>
      </p>
    </div>
  );
}
