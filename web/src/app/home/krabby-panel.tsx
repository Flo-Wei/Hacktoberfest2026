import Form from "next/form";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Crab } from "@/components/crab";

const PROMPTS = [
  { label: "Find veggie offers", message: "Help me find veggie offers" },
  { label: "Dinner inspiration", message: "Give me dinner inspiration" },
];

export function KrabbyPanel() {
  return (
    <section
      aria-labelledby="krabby-title"
      className="tinted-panel col-span-full grid grid-cols-[95px_1fr_39%] items-center gap-[23px] rounded-[25px] px-[30px] py-[25px] max-[1050px]:grid-cols-[70px_1fr_36%] max-[1050px]:gap-[17px] max-[1050px]:p-6 max-[830px]:grid-cols-[75px_1fr] max-[600px]:grid-cols-[57px_1fr] max-[600px]:gap-[15px] max-[600px]:rounded-[23px] max-[600px]:p-[22px]"
    >
      <div className="crab-host flex size-[90px] items-center justify-center rounded-full border border-[var(--glass-edge)] bg-card/70 max-[1050px]:size-[70px] max-[600px]:size-[57px]">
        <Crab size={64} walkOnHover className="max-[1050px]:scale-[0.8] max-[600px]:scale-[0.65]" />
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[1.4px] text-foreground/80 uppercase">
          <span aria-hidden className="size-[5px] rounded-full bg-success" />
          Your shopping companion
        </p>
        <h2
          id="krabby-title"
          className="my-1.5 text-[25px] leading-[1.2] font-[450] tracking-[-0.8px] max-[1050px]:text-[22px] max-[600px]:text-[21px]"
        >
          A little help from <span className="text-selected-foreground">Krabby.</span>
        </h2>
        <p className="max-w-[350px] text-sm leading-[1.7] text-foreground/80 max-[830px]:max-w-full">
          Stuck on what to pick? Let&apos;s find your next good thing together.
        </p>
      </div>
      <div className="min-w-0 max-[830px]:col-span-full">
        <Form
          action="/chat"
          className="flex items-center rounded-[13px] border border-[var(--glass-edge)] bg-card/70 py-1.5 pr-[7px] pl-3.5 transition-shadow duration-200 focus-within:ring-[3px] focus-within:ring-ring/50"
        >
          <input
            name="message"
            required
            maxLength={500}
            autoComplete="off"
            aria-label="Message Krabby"
            placeholder="Ask Krabby something…"
            className="h-11 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            aria-label="Chat with Krabby"
            className="grid size-11 shrink-0 place-items-center rounded-[9px] bg-foreground text-background outline-none transition-colors duration-200 hover:bg-foreground/85 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <ArrowRightIcon aria-hidden className="size-4" />
          </button>
        </Form>
        <div className="mt-2 flex flex-wrap gap-[7px]">
          {PROMPTS.map(({ label, message }) => (
            <Link
              key={label}
              href={`/chat?message=${encodeURIComponent(message)}`}
              className="inline-flex min-h-11 items-center rounded-full border bg-card/50 px-3 text-xs text-foreground/80 no-underline outline-none transition-colors duration-200 hover:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
