import { requireUser } from "@/lib/session";

function Tags({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-stone-600">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && <span className="text-sm text-stone-500">Noch nichts gewählt</span>}
        {items.map((item) => (
          <span key={item} className="rounded-full bg-orange-100 px-3 py-1 text-sm">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  const user = await requireUser();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Hallo {user.name}!</h1>
        <p className="text-stone-600">
          {user.age} Jahre, {user.city}
        </p>
      </div>
      <Tags title="Ziele" items={user.goals} />
      <Tags title="Präferenzen" items={user.preferences} />
    </div>
  );
}
