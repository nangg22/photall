"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export type AspectRatio = "free" | "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "3:4-pasfoto";

export interface CropRect {
  x: number; // 0–1 relative to canvas
  y: number;
  width: number;
  height: number;
}

interface EditorState {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  brightness: number;
  setBrightness: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  exportImage: (format: "image/png" | "image/jpeg" | "image/webp", quality: number) => void;
  // Crop
  isCropping: boolean;
  setIsCropping: (val: boolean) => void;
  cropRect: CropRect;
  setCropRect: (rect: CropRect) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  applyCrop: () => void;
}

const EditorContext = createContext<EditorState | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Crop state
  const [isCropping, setIsCropping] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });

  const exportImage = useCallback((format: string, quality: number) => {
    if (!canvasRef.current) {
      toast.error("Kanvas tidak ditemukan.");
      return;
    }
    try {
      const dataUrl = canvasRef.current.toDataURL(format, quality);
      const link = document.createElement("a");
      const ext = format === "image/jpeg" ? "jpg" : format.split("/")[1];
      link.download = `photall-export-${Date.now()}.${ext}`;
      link.href = dataUrl;
      link.click();
      toast.success("Gambar berhasil diunduh!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunduh gambar. Pastikan sumber gambar valid.");
    }
  }, []);

  const applyCrop = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const srcX = Math.round(cropRect.x * canvas.width);
    const srcY = Math.round(cropRect.y * canvas.height);
    const srcW = Math.round(cropRect.width * canvas.width);
    const srcH = Math.round(cropRect.height * canvas.height);

    // Get the cropped pixels
    const imageData = ctx.getImageData(srcX, srcY, srcW, srcH);

    // Resize canvas to cropped size
    canvas.width = srcW;
    canvas.height = srcH;
    ctx.putImageData(imageData, 0, 0);

    // Update the image URL from canvas so future operations use the cropped image
    const newUrl = canvas.toDataURL("image/png");
    setImageUrl(newUrl);

    // Reset crop state
    setIsCropping(false);
    setCropRect({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
    toast.success("Crop berhasil diterapkan!");
  }, [cropRect]);

  return (
    <EditorContext.Provider
      value={{
        imageUrl,
        setImageUrl,
        brightness,
        setBrightness,
        contrast,
        setContrast,
        canvasRef,
        exportImage: exportImage as EditorState["exportImage"],
        isCropping,
        setIsCropping,
        cropRect,
        setCropRect,
        aspectRatio,
        setAspectRatio,
        applyCrop,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
