import Link from "next/link";
import { OnboardingForm } from "./onboarding-form";

export default function OnboardingPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Welcome to Grabby</h1>
        <p className="text-stone-600">A few quick details and you&apos;re ready to go.</p>
      </div>
      <OnboardingForm />
      <p className="text-center text-sm">
        <Link href="/personas" className="text-stone-600 underline">
          Or use a mock persona
        </Link>
      </p>
    </div>
  );
}
