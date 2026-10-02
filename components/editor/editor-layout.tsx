"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EditorSidebar } from "./editor-sidebar";
import { EditorCanvas } from "./editor-canvas";
import { useEditor } from "@/contexts/editor-context";

export function EditorLayout() {
  const { imageUrl, setImageUrl } = useEditor();
  const router = useRouter();

  useEffect(() => {
    // Get image from session storage (used for MVP passing)
    const storedImage = sessionStorage.getItem("photall_current_image");
    if (storedImage) {
      setImageUrl(storedImage);
    } else {
      // If no image is provided, redirect to home
      router.push("/");
    }
  }, [router, setImageUrl]);

  if (!imageUrl) return null; // Avoid flashing

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-muted/20">
      <Header />
      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
        {/* Canvas Area */}
        <div className="flex-1 p-4 lg:p-8 flex items-center justify-center overflow-hidden">
          <EditorCanvas />
        </div>
        
        {/* Sidebar Tools */}
        <div className="w-full lg:w-80 xl:w-96 border-l bg-background flex flex-col h-full overflow-hidden shrink-0">
          <EditorSidebar />
        </div>
      </main>
    </div>
  );
}
