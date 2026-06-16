type RoadmapItemSection = "TOPICS" | "PRACTICE" | "PROJECT" | "INTERVIEW";

type RoadmapColumnItem = {
  id: string;
  section: RoadmapItemSection;
  text: string;
  completed: boolean;
};

type Props = {
  title: string;
  items: RoadmapColumnItem[];
  onToggle: (itemId: string) => void;
};

export default function RoadmapColumn({ title, items, onToggle }: Props) {
  return (
    <div className="border-slate-800 md:border-l md:pl-5">
      <h3 className="mb-4 text-sm font-semibold text-green-400">{title}</h3>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks yet.</p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className="flex w-full items-start gap-3 text-left text-sm text-slate-300 transition hover:text-white"
            >
              <span
                className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  item.completed
                    ? "border-green-500 bg-green-500 text-black"
                    : "border-slate-500"
                }`}
              >
                {item.completed ? "✓" : ""}
              </span>

              <span className={item.completed ? "line-through opacity-60" : ""}>
                {item.text}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}