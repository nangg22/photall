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
  // Background Removal
  isBgProcessing: boolean;
  bgLoadingMessage: string;
  removeBackground: () => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  originalFileSize: number;
  setOriginalFileSize: (size: number) => void;
}

const EditorContext = createContext<EditorState | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);

  // Crop state
  const [isCropping, setIsCropping] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });

  // Bg Removal State
  const [isBgProcessing, setIsBgProcessing] = useState(false);
  const [bgLoadingMessage, setBgLoadingMessage] = useState("");
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");

  // Initialize Web Worker
  React.useEffect(() => {
    workerRef.current = new Worker(new URL('@/lib/worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.addEventListener('message', (e) => {
      const { status, message, data, mask } = e.data;
      
      if (status === 'loading' || status === 'processing') {
        setBgLoadingMessage(message);
      } else if (status === 'progress') {
        // data contains download progress (e.g. { name, progress, status })
        if (data.status === 'downloading') {
          setBgLoadingMessage(`Mengunduh model... ${Math.round(data.progress || 0)}%`);
        }
      } else if (status === 'complete') {
        // We received the mask
        applyMaskToImage(mask);
      } else if (status === 'error') {
        setIsBgProcessing(false);
        toast.error(`Error: ${message}`);
      }
    });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const applyMaskToImage = useCallback((mask: { data: any, width: number, height: number }) => {
    if (!canvasRef.current || !imageUrl) {
      setIsBgProcessing(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      setIsBgProcessing(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      // Create a temporary canvas for original image
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;
      tempCtx.drawImage(img, 0, 0);
      const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

      // Create a canvas for the mask
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = mask.width;
      maskCanvas.height = mask.height;
      const maskCtx = maskCanvas.getContext("2d");
      if (!maskCtx) return;

      // Draw mask data
      const maskImageData = maskCtx.createImageData(mask.width, mask.height);
      // mask.data from transformers is a Float32Array or Uint8Array of grayscale values
      for (let i = 0; i < mask.data.length; i++) {
        const val = typeof mask.data[i] === 'number' && mask.data[i] <= 1 ? mask.data[i] * 255 : mask.data[i];
        maskImageData.data[i * 4] = val;     // R
        maskImageData.data[i * 4 + 1] = val; // G
        maskImageData.data[i * 4 + 2] = val; // B
        maskImageData.data[i * 4 + 3] = 255; // A
      }
      maskCtx.putImageData(maskImageData, 0, 0);

      // We need to resize the mask to match the original image size if they differ
      const resizedMaskCanvas = document.createElement("canvas");
      resizedMaskCanvas.width = img.width;
      resizedMaskCanvas.height = img.height;
      const resizedMaskCtx = resizedMaskCanvas.getContext("2d");
      if (!resizedMaskCtx) return;
      resizedMaskCtx.drawImage(maskCanvas, 0, 0, img.width, img.height);
      
      const resizedMaskData = resizedMaskCtx.getImageData(0, 0, img.width, img.height);

      // Apply mask to original image data (modify alpha channel)
      for (let i = 0; i < imgData.data.length; i += 4) {
        // mask is grayscale, just take the red channel (or any)
        const alpha = resizedMaskData.data[i];
        imgData.data[i + 3] = alpha; // update alpha channel of the original image
      }

      tempCtx.putImageData(imgData, 0, 0);

      setImageUrl(tempCanvas.toDataURL("image/png"));
      setIsBgProcessing(false);
      setBgLoadingMessage("");
      toast.success("Latar belakang berhasil dihapus!");
    };
  }, [imageUrl]);

  const removeBackground = useCallback(() => {
    if (!workerRef.current || !imageUrl) return;
    setIsBgProcessing(true);
    setBgLoadingMessage("Mempersiapkan...");
    
    // We send the current imageUrl (original or previously cropped/edited) to the worker
    workerRef.current.postMessage({
      action: 'remove-background',
      imageUrl: imageUrl
    });
  }, [imageUrl]);


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
        isBgProcessing,
        bgLoadingMessage,
        removeBackground,
        backgroundColor,
        setBackgroundColor,
        originalFileSize,
        setOriginalFileSize,
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
