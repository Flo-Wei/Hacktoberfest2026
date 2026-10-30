export function Placeholder({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-stone-600">{text}</p>
      <p className="inline-block rounded-full bg-stone-200 px-3 py-1 text-sm">Kommt später</p>
    </div>
  );
}
