"use client";

import { useOptimistic, useTransition } from "react";
import type { RoadmapItem } from "@/generated/prisma/client";
import { toggleRoadmapItem } from "@/app/roadmaps/[roadmapId]/actions";

type Props = {
  title: string;
  items: RoadmapItem[];
  roadmapId: string;
};

export default function RoadmapColumn({ title, items, roadmapId }: Props) {
  const [isPending, startTransition] = useTransition();

  const [optimisticItems, toggleOptimisticItem] = useOptimistic(
    items,
    (currentItems, itemId: string) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, completed: !item.completed }
          : item,
      ),
  );

  return (
    <div className="border-slate-800 md:border-l md:pl-5">
      <h3 className="mb-4 text-sm font-semibold text-green-400">{title}</h3>

      <div className="space-y-3">
        {optimisticItems.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks yet.</p>
        ) : (
          optimisticItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                toggleOptimisticItem(item.id);

                startTransition(async () => {
                  const formData = new FormData();
                  formData.set("itemId", item.id);
                  formData.set("roadmapId", roadmapId);

                  await toggleRoadmapItem(formData);
                });
              }}
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