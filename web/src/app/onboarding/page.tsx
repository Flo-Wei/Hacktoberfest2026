import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CrabWalk } from "@/components/crab";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./login-form";
import { OnboardingForm } from "./onboarding-form";
import "./motion.css";
import "./onboarding.css";

const SUBLINK = "w-fit underline underline-offset-4 hover:text-foreground";

type OnboardingPageProps = { searchParams: Promise<{ mode?: string }> };

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { mode } = await searchParams;
  const loggingIn = mode === "login";
  if (loggingIn && (await getCurrentUser())) redirect("/");

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border bg-card lg:grid lg:min-h-[54rem] lg:grid-cols-[minmax(0,1fr)_34rem] lg:gap-6 lg:p-12">
      <div className="onboard-art absolute inset-x-0 top-0 h-90 lg:inset-y-0 lg:right-auto lg:h-auto lg:w-[84%]">
        <Image
          src="/onboarding/hero.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 84vw, 100vw"
          className="object-cover object-left-top"
        />
      </div>
      <div className="relative flex min-h-48 flex-col justify-between gap-6 p-6 lg:min-h-0 lg:p-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
            {loggingIn ? "Welcome back" : "Welcome to Grabby"}
          </h1>
          <p className="text-balance">
            {loggingIn ? "Log in and pick up where you left off." : "A few quick details and you're ready to go."}
          </p>
        </div>
      </div>
      <div className="relative flex flex-col px-4 pb-4 lg:p-0">
        {/* The art is full of coral flowers, so the crab walks along the panel's edge. */}
        <CrabWalk size={56} className="absolute inset-x-8 bottom-full -mb-1 lg:inset-x-4" />
        {loggingIn ? (
          <div className="onboard-glass flex flex-col gap-6 p-5 sm:p-6">
            <LoginForm />
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/onboarding" className={SUBLINK}>
                Create an account
              </Link>
              <Link href="/personas" className={SUBLINK}>
                Use a test profile
              </Link>
            </div>
          </div>
        ) : (
          <OnboardingForm />
        )}
      </div>
    </div>
  );
}
