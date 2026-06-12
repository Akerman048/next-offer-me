"use client";

import { useOptimistic, useTransition } from "react";
import type { RoadmapItem, RoadmapWeek } from "@/generated/prisma/client";
import { toggleRoadmapItem } from "@/app/roadmaps/[roadmapId]/actions";
import RoadmapColumn from "./RoadmapColumn";

type WeekWithItems = RoadmapWeek & {
  items: RoadmapItem[];
};

type Props = {
  week: WeekWithItems;
  roadmapId: string;
};

export default function RoadmapWeekCard({ week, roadmapId }: Props) {
  const [, startTransition] = useTransition();

  const [items, toggleItem] = useOptimistic(
    week.items,
    (currentItems, itemId: string) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item,
      ),
  );

  const completed = items.filter((item) => item.completed).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

const handleToggle = (itemId: string) => {
  startTransition(async () => {
    toggleItem(itemId);

    const formData = new FormData();
    formData.set("itemId", itemId);
    formData.set("roadmapId", roadmapId);

    await toggleRoadmapItem(formData);
  });
};

  const topics = items.filter((item) => item.section === "TOPICS");
  const practice = items.filter((item) => item.section === "PRACTICE");
  const project = items.filter((item) => item.section === "PROJECT");
  const interview = items.filter((item) => item.section === "INTERVIEW");

  return (
    <section className="mb-6 rounded-3xl border border-border bg-card p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-success">Week {week.weekNumber}</p>
          <h2 className="text-2xl font-bold">{week.title}</h2>
          <p className="mt-2 text-sm text-muted">{week.description}</p>
        </div>

        <div className="min-w-40">
          <p className="mb-2 text-sm text-muted">
            {completed} / {total} completed
          </p>

          <div className="h-2 rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-success"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
<RoadmapColumn
  title="Topics to review"
  items={topics}
  onToggle={handleToggle}
/>

<RoadmapColumn
  title="Practice tasks"
  items={practice}
  onToggle={handleToggle}
/>

<RoadmapColumn
  title="Mini project"
  items={project}
  onToggle={handleToggle}
/>

<RoadmapColumn
  title="Before next interview"
  items={interview}
  onToggle={handleToggle}
/>
      </div>
    </section>
  );
}