import Link from "next/link";
import { switchUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { listMockUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function PersonasPage() {
  const users = await listMockUsers();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Test profiles</h1>
        <p className="text-muted-foreground">
          Try one of {users.length} made-up profiles.{" "}
          <Link href="/onboarding" className="underline underline-offset-4 hover:text-foreground">
            Create your own
          </Link>
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <li key={user.id}>
            <form action={switchUser} className="h-full">
              <input type="hidden" name="id" value={user.id} />
              <Button
                variant="ghost"
                className="glass size-full flex-col items-start justify-start gap-1 rounded-[26px] p-4 text-left whitespace-normal hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
              >
                <span className="flex w-full items-baseline justify-between gap-2">
                  {user.name}
                  <span className="text-sm font-normal text-muted-foreground">
                    {user.age}, {user.city}
                  </span>
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {[...user.goals, ...user.preferences].join(" · ")}
                </span>
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
