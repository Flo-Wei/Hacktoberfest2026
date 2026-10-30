import { CrabWalk } from "@/components/crab";

type AuthLayoutProps = {
  title: string;
  text: string;
  children: React.ReactNode;
};

export function AuthLayout({ title, text, children }: AuthLayoutProps) {
  return (
    <div className="grid flex-1 overflow-hidden rounded-xl border bg-card lg:grid-cols-2">
      <div className="flex flex-col justify-center gap-6 bg-selected p-6 lg:gap-10 lg:p-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h1>
          <p className="text-foreground">{text}</p>
        </div>
        <CrabWalk size={140} />
      </div>
      <div className="flex flex-col justify-center gap-6 p-6 lg:p-12">{children}</div>
    </div>
  );
}
