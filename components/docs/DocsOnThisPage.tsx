type Props = {
  items?: { id: string; label: string }[];
};

export default function DocsOnThisPage({ items = [] }: Props) {
  const defaultItems = [
    { id: "why-choose", label: "Why Choose LuxeWear?" },
  ];
  const list = items.length ? items : defaultItems;
  return (
    <aside className="hidden xl:block xl:col-span-2">
      <div className="sticky top-24 rounded-xl border p-4">
        <div className="text-xs font-semibold text-muted-foreground">On this page</div>
        <ul className="mt-3 space-y-2 text-sm">
          {list.map((i) => (
            <li key={i.id}>
              <a className="text-muted-foreground hover:underline" href={`#${i.id}`}>{i.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
