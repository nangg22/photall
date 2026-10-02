"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/contexts/editor-context";
import { CropOverlay } from "./crop-overlay";

export function EditorCanvas() {
  const { imageUrl, brightness, contrast, canvasRef, isCropping } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Track container size for crop overlay positioning
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const b = 100 + brightness;
      const c = 100 + contrast;

      ctx.filter = `brightness(${b}%) contrast(${c}%)`;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }, [imageUrl, brightness, contrast, canvasRef]);

  // Measure canvas rendered size so CropOverlay maps correctly
  const canvasEl = canvasRef.current;
  const canvasDisplayWidth = canvasEl?.clientWidth ?? 0;
  const canvasDisplayHeight = canvasEl?.clientHeight ?? 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center rounded-xl border border-dashed bg-background/50 shadow-sm p-4 overflow-hidden"
    >
      {/* Canvas Toolbar */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full shadow-sm bg-background/80 backdrop-blur"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas + Crop Overlay wrapper */}
      <div className="relative flex items-center justify-center max-w-full max-h-full">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain drop-shadow-md rounded-md"
          style={{ display: "block" }}
        />
        {isCropping && (
          <div
            className="absolute inset-0"
            style={{ pointerEvents: "none" }}
          >
            <CropOverlay
              containerWidth={canvasDisplayWidth}
              containerHeight={canvasDisplayHeight}
            />
          </div>
        )}
      </div>
    </div>
  );
}
