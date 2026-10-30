import { CheckIcon, CircleAlertIcon } from "lucide-react";
import { cn } from "cn";

export type SetupStage = {
  label: string;
  detail?: string;
  status: "waiting" | "active" | "done" | "error";
};

const STATUS_TEXT: Record<SetupStage["status"], string> = {
  waiting: "waiting",
  active: "in progress",
  done: "done",
  error: "failed",
};

function Indicator({ status }: { status: SetupStage["status"] }) {
  if (status === "done") {
    return (
      <span className="onboard-settle flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <CheckIcon aria-hidden strokeWidth={3} className="onboard-check size-4" />
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex size-8 items-center justify-center rounded-full border-2 border-destructive bg-card text-destructive">
        <CircleAlertIcon aria-hidden className="size-4" />
      </span>
    );
  }

  if (status === "active") {
    return (
      <svg aria-hidden viewBox="0 0 32 32" className="onboard-spin size-8 rounded-full bg-card">
        <circle cx="16" cy="16" r="14" fill="none" strokeWidth="3" className="stroke-border" />
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="0.3 0.7"
          className="stroke-primary"
        />
      </svg>
    );
  }

  return <span className="block size-8 rounded-full border-2 border-input bg-card" />;
}

export function SetupProgress({ stages }: { stages: SetupStage[] }) {
  return (
    <ol aria-live="polite" className="flex flex-col">
      {stages.map((stage, index) => (
        <li key={stage.label} className="relative flex gap-3 pb-6 last:pb-0">
          {index < stages.length - 1 && (
            <span aria-hidden className="absolute top-8 bottom-0 left-[15px] w-0.5 overflow-hidden bg-border">
              <span
                className={cn(
                  "block size-full origin-top bg-primary transition-transform duration-300 ease-out motion-reduce:transition-none",
                  stage.status === "done" ? "scale-y-100" : "scale-y-0",
                )}
              />
            </span>
          )}
          <span className="relative shrink-0">
            <Indicator status={stage.status} />
          </span>
          <div className="flex min-w-0 flex-col pt-1">
            <p
              className={cn(
                "font-medium transition-colors duration-200",
                stage.status === "waiting" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {stage.label}
              <span className="sr-only">, {STATUS_TEXT[stage.status]}</span>
            </p>
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                stage.detail ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <p className="min-h-0 overflow-hidden text-sm text-muted-foreground tabular-nums">
                {stage.detail}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
