"use client";

import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorCanvasProps {
  imageUrl: string;
}

export function EditorCanvas({ imageUrl }: EditorCanvasProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center rounded-xl border border-dashed bg-background/50 shadow-sm p-4 overflow-hidden">
      {/* Canvas Toolbars overlay */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm bg-background/80 backdrop-blur">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Preview"
        className="max-w-full max-h-full object-contain drop-shadow-md rounded-md"
      />
    </div>
  );
}
