import { CheckIcon } from "lucide-react";
import { cn } from "cn";

type StepperProps = {
  steps: string[];
  current: number;
};

export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const last = index === steps.length - 1;

        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className={cn("flex items-center gap-1.5 sm:gap-2", !last && "min-w-0 flex-1")}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border bg-card text-sm tabular-nums transition-colors duration-200 sm:size-9 sm:text-base",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-2 border-foreground font-semibold text-foreground",
                !done && !active && "border-input text-muted-foreground",
              )}
            >
              {done ? (
                <CheckIcon aria-hidden strokeWidth={3} className="onboard-check size-4 sm:size-5" />
              ) : (
                <span aria-hidden>{index + 1}</span>
              )}
            </span>
            {/* Below 360px only the current label fits. The others stay readable to screen readers. */}
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-200 sm:text-base",
                active || done ? "text-foreground" : "text-muted-foreground",
                !active && "max-[359px]:sr-only",
              )}
            >
              {step}
              {done && <span className="sr-only">, done</span>}
            </span>
            {!last && (
              <span aria-hidden className="h-px min-w-2 flex-1 overflow-hidden bg-input sm:min-w-3">
                <span
                  className={cn(
                    "block h-full origin-left bg-primary transition-transform duration-300 ease-out motion-reduce:transition-none",
                    done ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
