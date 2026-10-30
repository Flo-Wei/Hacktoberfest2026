"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckIcon, CircleAlertIcon } from "lucide-react";
import { prepareDeck, register } from "@/app/actions";
import { Crab } from "@/components/crab";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CITIES, GOALS, PREFERENCES } from "@/lib/options";
import { AvatarField } from "./avatar-field";
import { SetupProgress, type SetupStage } from "./setup-progress";
import { Stepper } from "./stepper";

type Draft = {
  avatar: string | null;
  name: string;
  age: string;
  city: string;
  goals: string[];
  preferences: string[];
};

type Errors = Partial<Record<"name" | "age" | "city", string>>;

type StepProps = {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
  errors: Errors;
  goTo: (step: number) => void;
};

const EMPTY_DRAFT: Draft = { avatar: null, name: "", age: "", city: "", goals: [], preferences: [] };

const SETUP_STAGES = [
  "Saving your profile",
  "Matching your goals and diet",
  "Building your swipe deck",
];

// Same rules and messages as the register action, so nobody meets them at the end.
function validateDetails(draft: Draft) {
  const errors: Errors = {};
  const age = Number(draft.age);
  if (!draft.name.trim()) errors.name = "Please enter your name.";
  if (!Number.isInteger(age) || age < 1 || age > 120) errors.age = "Please enter a valid age.";
  if (!CITIES.includes(draft.city)) errors.city = "Please choose a city.";
  return errors;
}

function toFormData(draft: Draft) {
  const form = new FormData();
  form.set("name", draft.name);
  form.set("age", draft.age);
  form.set("city", draft.city);
  if (draft.avatar) form.set("avatar", draft.avatar);
  draft.goals.forEach((goal) => form.append("goals", goal));
  draft.preferences.forEach((preference) => form.append("preferences", preference));
  return form;
}

function productCount(count: number) {
  return `${count} ${count === 1 ? "product" : "products"}`;
}

// Real work can finish in a blink, so each stage stays long enough to read.
function holdStage() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return new Promise((resolve) => setTimeout(resolve, reduced ? 0 : 600));
}

function useAutoHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, height };
}

function DetailsStep({ draft, update, errors }: StepProps) {
  return (
    <FieldGroup>
      <AvatarField value={draft.avatar} onChange={(avatar) => update({ avatar })} />
      <Field data-invalid={errors.name ? true : undefined}>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          value={draft.name}
          onChange={(event) => update({ name: event.target.value })}
          required
          maxLength={80}
          autoComplete="given-name"
          aria-invalid={errors.name ? true : undefined}
        />
        <FieldError>{errors.name}</FieldError>
      </Field>
      <Field data-invalid={errors.age ? true : undefined}>
        <FieldLabel htmlFor="age">Age</FieldLabel>
        <Input
          id="age"
          type="number"
          inputMode="numeric"
          value={draft.age}
          onChange={(event) => update({ age: event.target.value })}
          required
          min={1}
          max={120}
          aria-invalid={errors.age ? true : undefined}
        />
        <FieldError>{errors.age}</FieldError>
      </Field>
      <Field data-invalid={errors.city ? true : undefined}>
        <FieldLabel htmlFor="city">City</FieldLabel>
        <Select value={draft.city} onValueChange={(city) => update({ city })}>
          <SelectTrigger id="city" className="w-full" aria-invalid={errors.city ? true : undefined}>
            <SelectValue placeholder="Choose a city" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldError>{errors.city}</FieldError>
      </Field>
    </FieldGroup>
  );
}

type ChipsProps = {
  legend: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

function Chips({ legend, options, selected, onChange }: ChipsProps) {
  return (
    <FieldSet>
      <FieldLegend>{legend}</FieldLegend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="group flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-input bg-card px-3.5 text-sm font-medium transition-colors duration-150 hover:bg-accent has-checked:border-selected-foreground has-checked:bg-selected has-checked:text-selected-foreground has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...selected, option]
                    : selected.filter((item) => item !== option),
                )
              }
              className="sr-only"
            />
            <CheckIcon
              aria-hidden
              className="hidden size-4 duration-150 animate-in zoom-in-50 group-has-checked:block motion-reduce:animate-none"
            />
            {option}
          </label>
        ))}
      </div>
    </FieldSet>
  );
}

function TastesStep({ draft, update }: StepProps) {
  return (
    <FieldGroup>
      <FieldDescription>Optional. Pick as many as you like, or skip.</FieldDescription>
      <Chips
        legend="What's your goal?"
        options={GOALS}
        selected={draft.goals}
        onChange={(goals) => update({ goals })}
      />
      <Chips
        legend="What do you like to buy?"
        options={PREFERENCES}
        selected={draft.preferences}
        onChange={(preferences) => update({ preferences })}
      />
    </FieldGroup>
  );
}

function ReviewRow({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5">
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

function ReviewTags({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="font-normal text-muted-foreground">Nothing selected yet</span>;
  }
  return (
    <span className="flex flex-wrap justify-end gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="selected">
          {item}
        </Badge>
      ))}
    </span>
  );
}

function ReviewStep({ draft, goTo }: StepProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          {draft.avatar && <AvatarImage src={draft.avatar} alt="" />}
          <AvatarFallback className="bg-selected">
            <Crab size={32} />
          </AvatarFallback>
        </Avatar>
        <p className="min-w-0 flex-1 truncate font-semibold">{draft.name.trim()}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-mr-3"
          aria-label="Edit your details"
          onClick={() => goTo(0)}
        >
          Edit
        </Button>
      </div>
      <dl className="divide-y">
        <ReviewRow term="Age">{draft.age}</ReviewRow>
        <ReviewRow term="City">{draft.city}</ReviewRow>
      </dl>
      <Separator />
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Your tastes</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-mr-3"
          aria-label="Edit your tastes"
          onClick={() => goTo(1)}
        >
          Edit
        </Button>
      </div>
      <dl className="divide-y">
        <ReviewRow term="Goals">
          <ReviewTags items={draft.goals} />
        </ReviewRow>
        <ReviewRow term="Preferences">
          <ReviewTags items={draft.preferences} />
        </ReviewRow>
      </dl>
    </div>
  );
}

const STEPS = [
  { label: "You", title: "Tell us about you", Body: DetailsStep, validate: validateDetails },
  { label: "Tastes", title: "What are you after?", Body: TastesStep },
  { label: "Review", title: "Does this look right?", Body: ReviewStep },
];

const STEP_LABELS = STEPS.map((step) => step.label);

export function OnboardingForm() {
  const [phase, setPhase] = useState<"form" | "setup" | "success">("form");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [setup, setSetup] = useState<{ active: number; details: string[] }>({
    active: 0,
    details: [],
  });
  const [total, setTotal] = useState<number | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const { ref: content, height } = useAutoHeight();

  // Steps replace each other, so keep keyboard and screen reader users in place.
  useEffect(() => {
    if (moved.current) heading.current?.focus();
    moved.current = true;
  }, [step, phase]);

  function update(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((key) => delete next[key as keyof Errors]);
      return next;
    });
  }

  function goTo(next: number) {
    setDirection(next < step ? "back" : "forward");
    setStep(next);
  }

  async function finish() {
    setError(null);
    setSetup({ active: 0, details: [] });
    setPhase("setup");

    const [message] = await Promise.all([
      register(toFormData(draft)).catch(() => "Something went wrong. Please try again."),
      holdStage(),
    ]);
    if (message) {
      setError(message);
      setPhase("form");
      return;
    }
    setSetup({ active: 1, details: [] });

    // The profile is saved by now, so a failed count must not block the finish.
    const [deck] = await Promise.all([prepareDeck().catch(() => null), holdStage()]);
    const details = deck
      ? [
          "",
          deck.matched > 0
            ? `${productCount(deck.matched)} fit you`
            : "No filters, so you'll see everything",
        ]
      : [];
    setSetup({ active: 2, details });
    await holdStage();

    if (deck) details[2] = `${productCount(deck.total)} ready`;
    setSetup({ active: 3, details });
    setTotal(deck?.total ?? null);
    await holdStage();
    setPhase("success");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = STEPS[step].validate?.(draft) ?? {};
    const invalid = Object.keys(found);
    setErrors(found);
    if (invalid.length > 0) {
      document.getElementById(invalid[0])?.focus();
    } else if (step < STEPS.length - 1) {
      goTo(step + 1);
    } else {
      finish();
    }
  }

  const stages: SetupStage[] = SETUP_STAGES.map((label, index) => ({
    label,
    detail: setup.details[index] || undefined,
    status: index < setup.active ? "done" : index === setup.active ? "active" : "waiting",
  }));
  const { title, Body } = STEPS[step];
  const firstName = draft.name.trim().split(/\s+/)[0];
  const headingClass = "text-xl font-semibold outline-none";

  return (
    <div className="onboard-glass p-5 sm:p-6">
      <div className="onboard-sharpen -m-1 overflow-hidden transition-[height] duration-240 ease-out motion-reduce:transition-none" style={{ height }}>
        <div ref={content} className="flex flex-col gap-6 p-1">
          {phase === "form" && (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              <Stepper steps={STEP_LABELS} current={step} />
              <div
                key={step}
                className={`flex flex-col gap-5 duration-200 ease-out animate-in fade-in motion-reduce:animate-none ${
                  direction === "forward" ? "slide-in-from-right-4" : "slide-in-from-left-4"
                }`}
              >
                <h2 ref={heading} tabIndex={-1} className={headingClass}>
                  {title}
                </h2>
                <Body draft={draft} update={update} errors={errors} goTo={goTo} />
              </div>
              {error && (
                <Alert variant="destructive">
                  <CircleAlertIcon />
                  <AlertTitle className="line-clamp-none">{error}</AlertTitle>
                </Alert>
              )}
              <div className="flex gap-3">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={() => goTo(step - 1)}>
                    Back
                  </Button>
                )}
                <Button className="flex-1">
                  {step < STEPS.length - 1 ? "Continue" : "Create my profile"}
                </Button>
              </div>
              <Link
                href="/onboarding?mode=login"
                className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Log in with an existing account
              </Link>
            </form>
          )}
          {phase === "setup" && (
            <div className="flex flex-col gap-5 duration-200 animate-in fade-in motion-reduce:animate-none">
              <h2 ref={heading} tabIndex={-1} className={headingClass}>
                Setting things up
              </h2>
              <SetupProgress stages={stages} />
            </div>
          )}
          {phase === "success" && (
            <div
              role="status"
              className="flex flex-col items-center gap-3 py-4 text-center duration-200 animate-in fade-in motion-reduce:animate-none"
            >
              <Crab size={72} className="onboard-hop" />
              <h2 ref={heading} tabIndex={-1} className={headingClass}>
                You&apos;re all set, {firstName}!
              </h2>
              {total ? (
                <p className="text-muted-foreground">
                  {productCount(total)} {total === 1 ? "is" : "are"} ready to swipe.
                </p>
              ) : null}
              <Button asChild className="mt-3 w-full">
                <Link href="/swipe">Start swiping</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
