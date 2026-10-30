"use client";

import { useActionState } from "react";
import { register } from "@/app/actions";
import { CITIES, GOALS, PREFERENCES } from "@/lib/options";

const FIELD = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2";

function Checkboxes({ legend, name, options }: { legend: string; name: string; options: string[] }) {
  return (
    <fieldset>
      <legend className="mb-2 font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="cursor-pointer rounded-full border border-stone-300 bg-white px-3 py-1 text-sm has-checked:border-orange-500 has-checked:bg-orange-100"
          >
            <input type="checkbox" name={name} value={option} className="sr-only" />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function OnboardingForm() {
  const [error, action, pending] = useActionState(register, null);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block font-medium">Name</span>
        <input name="name" required maxLength={80} className={FIELD} />
      </label>
      <label className="block">
        <span className="mb-1 block font-medium">Alter</span>
        <input name="age" type="number" required min={1} max={120} className={FIELD} />
      </label>
      <label className="block">
        <span className="mb-1 block font-medium">Stadt</span>
        <select name="city" required defaultValue="" className={FIELD}>
          <option value="" disabled>
            Bitte wählen
          </option>
          {CITIES.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </label>
      <Checkboxes legend="Deine Ziele" name="goals" options={GOALS} />
      <Checkboxes legend="Deine Präferenzen" name="preferences" options={PREFERENCES} />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-lg bg-orange-600 py-3 font-semibold text-white disabled:opacity-60"
      >
        Los geht&apos;s
      </button>
    </form>
  );
}
