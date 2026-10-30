import Link from "next/link";
import { switchUser } from "@/app/actions";
import { listMockUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function PersonasPage() {
  const users = await listMockUsers();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Mock personas</h1>
        <p className="text-stone-600">
          {users.length} test profiles.{" "}
          <Link href="/onboarding" className="underline">
            Create a new profile
          </Link>
        </p>
      </div>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id}>
            <form action={switchUser}>
              <input type="hidden" name="id" value={user.id} />
              <button className="w-full rounded-lg border border-stone-200 bg-white p-3 text-left hover:border-orange-400">
                <span className="font-medium">{user.name}</span>
                <span className="text-stone-600">
                  , {user.age}, {user.city}
                </span>
                <span className="block text-sm text-stone-600">
                  {[...user.goals, ...user.preferences].join(" · ")}
                </span>
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
