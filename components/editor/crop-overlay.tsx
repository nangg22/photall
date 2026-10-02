"use client";

import { useRef, useCallback, useEffect } from "react";
import { useEditor, AspectRatio, CropRect } from "@/contexts/editor-context";

const RATIO_MAP: Record<AspectRatio, number | null> = {
  free: null,
  "1:1": 1,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "3:4-pasfoto": 3 / 4,
};

interface DragState {
  type: "move" | "resize-br" | "resize-bl" | "resize-tr" | "resize-tl";
  startX: number;
  startY: number;
  startRect: CropRect;
}

export function CropOverlay({ containerWidth, containerHeight }: { containerWidth: number; containerHeight: number }) {
  const { cropRect, setCropRect, aspectRatio } = useEditor();
  const dragRef = useRef<DragState | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const applyRatio = useCallback(
    (rect: CropRect, anchorCorner: "tl" | "tr" | "br" | "bl" | "move"): CropRect => {
      const ratio = RATIO_MAP[aspectRatio];
      if (!ratio || anchorCorner === "move") return rect;

      // Lock height based on width and ratio
      const newHeight = rect.width / ratio;
      return { ...rect, height: Math.min(newHeight, 1 - rect.y) };
    },
    [aspectRatio]
  );

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const onMouseDown = useCallback(
    (e: React.MouseEvent, type: DragState["type"]) => {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = {
        type,
        startX: e.clientX,
        startY: e.clientY,
        startRect: { ...cropRect },
      };
    },
    [cropRect]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || containerWidth === 0 || containerHeight === 0) return;
      const { type, startX, startY, startRect } = dragRef.current;
      const dx = (e.clientX - startX) / containerWidth;
      const dy = (e.clientY - startY) / containerHeight;

      let next = { ...startRect };

      if (type === "move") {
        next.x = clamp(startRect.x + dx, 0, 1 - startRect.width);
        next.y = clamp(startRect.y + dy, 0, 1 - startRect.height);
      } else if (type === "resize-br") {
        next.width = clamp(startRect.width + dx, 0.05, 1 - startRect.x);
        next.height = clamp(startRect.height + dy, 0.05, 1 - startRect.y);
        next = applyRatio(next, "br");
      } else if (type === "resize-bl") {
        const newX = clamp(startRect.x + dx, 0, startRect.x + startRect.width - 0.05);
        next.x = newX;
        next.width = startRect.x + startRect.width - newX;
        next.height = clamp(startRect.height + dy, 0.05, 1 - startRect.y);
        next = applyRatio(next, "bl");
      } else if (type === "resize-tr") {
        next.width = clamp(startRect.width + dx, 0.05, 1 - startRect.x);
        const newH = clamp(startRect.height - dy, 0.05, startRect.y + startRect.height);
        const newY = startRect.y + startRect.height - newH;
        next.y = newY;
        next.height = newH;
        next = applyRatio(next, "tr");
      } else if (type === "resize-tl") {
        const newX = clamp(startRect.x + dx, 0, startRect.x + startRect.width - 0.05);
        next.x = newX;
        next.width = startRect.x + startRect.width - newX;
        const newH = clamp(startRect.height - dy, 0.05, startRect.y + startRect.height);
        const newY = startRect.y + startRect.height - newH;
        next.y = newY;
        next.height = newH;
        next = applyRatio(next, "tl");
      }

      setCropRect(next);
    };

    const onMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [containerWidth, containerHeight, applyRatio, setCropRect]);

  const left = cropRect.x * containerWidth;
  const top = cropRect.y * containerHeight;
  const width = cropRect.width * containerWidth;
  const height = cropRect.height * containerHeight;

  const handleClass =
    "absolute w-4 h-4 bg-white border-2 border-primary rounded-sm z-20 shadow";

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10"
      style={{ pointerEvents: "none" }}
    >
      {/* Dark overlay — 4 sides */}
      <div className="absolute inset-0 bg-black/50" style={{ clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${top}px, ${left}px ${top}px, ${left}px ${top + height}px, ${left + width}px ${top + height}px, ${left + width}px ${top}px, 0% ${top}px)` }} />

      {/* Crop box */}
      <div
        className="absolute border-2 border-primary cursor-move z-10"
        style={{
          left,
          top,
          width,
          height,
          pointerEvents: "all",
          boxSizing: "border-box",
        }}
        onMouseDown={(e) => onMouseDown(e, "move")}
      >
        {/* Rule-of-thirds grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full border-t border-white/30" style={{ top: "33.33%" }} />
          <div className="absolute w-full border-t border-white/30" style={{ top: "66.66%" }} />
          <div className="absolute h-full border-l border-white/30" style={{ left: "33.33%" }} />
          <div className="absolute h-full border-l border-white/30" style={{ left: "66.66%" }} />
        </div>

        {/* Corner handles */}
        <div className={`${handleClass} -top-2 -left-2 cursor-nw-resize`} onMouseDown={(e) => onMouseDown(e, "resize-tl")} style={{ pointerEvents: "all" }} />
        <div className={`${handleClass} -top-2 -right-2 cursor-ne-resize`} onMouseDown={(e) => onMouseDown(e, "resize-tr")} style={{ pointerEvents: "all" }} />
        <div className={`${handleClass} -bottom-2 -left-2 cursor-sw-resize`} onMouseDown={(e) => onMouseDown(e, "resize-bl")} style={{ pointerEvents: "all" }} />
        <div className={`${handleClass} -bottom-2 -right-2 cursor-se-resize`} onMouseDown={(e) => onMouseDown(e, "resize-br")} style={{ pointerEvents: "all" }} />
      </div>
    </div>
  );
}
