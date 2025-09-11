import { useState, useEffect, useRef } from "react";
import { Bathroom } from "@/types";
import { BathroomCard } from "./BathroomCard";

interface BathroomListProps {
  bathrooms: Bathroom[];
  title?: string;
  showDistance?: boolean;
  onBathroomSelect?: (bathroom: Bathroom) => void;
  animate?: boolean;
}

export function BathroomList({
  bathrooms,
  title,
  showDistance = true,
  onBathroomSelect,
  animate = false,
}: BathroomListProps) {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate) return;

    const container = listRef.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll("[data-bathroom-item]")
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idxAttr = (e.target as HTMLElement).dataset.index;
            const idx = idxAttr ? parseInt(idxAttr) : -1;
            setVisibleIndices((prev) => {
              const next = new Set(prev);
              if (idx >= 0) next.add(idx);
              return next;
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [bathrooms, animate]);

  if (bathrooms.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma casa de banho encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      )}

      <div className="space-y-3" ref={listRef}>
        {bathrooms.map((bathroom, index) => (
          <div
            key={bathroom.id}
            data-bathroom-item
            data-index={index}
            className={
              animate
                ? `transition-all duration-500 ${
                    visibleIndices.has(index)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                  }`
                : ""
            }
            style={animate ? { transitionDelay: `${index * 60}ms` } : {}}
          >
            <BathroomCard
              bathroom={bathroom}
              distance={
                showDistance
                  ? bathroom.dynamicDistance ?? bathroom.distance
                  : undefined
              }
              onViewDetails={() => onBathroomSelect?.(bathroom)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
