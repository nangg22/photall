"use client";

import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }

    // Validate size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Ukuran gambar terlalu besar. Maksimal 20 MB.");
      return;
    }

    // Create object URL for local processing
    const objectUrl = URL.createObjectURL(file);
    
    // In a real app we'd probably use Context or a store, 
    // but for now we'll simulate going to the editor
    // Note: We need a way to pass the URL to the editor, 
    // passing via sessionStorage is a simple MVP approach
    sessionStorage.setItem("photall_current_image", objectUrl);
    sessionStorage.setItem("photall_original_size", file.size.toString());
    
    toast.success("Gambar berhasil dimuat!");
    router.push("/editor");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [router]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-colors
        ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileInput}
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-primary/10 p-4">
          <UploadCloud className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Tarik dan lepas gambar di sini</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Atau klik tombol di bawah untuk memilih file
          </p>
        </div>
        <label
          htmlFor="file-upload"
          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Pilih Gambar
        </label>
      </div>
      <div className="mt-8 flex flex-col items-center gap-1 text-xs text-muted-foreground">
        <p>Mendukung JPG, PNG, dan WebP (Maks 20 MB)</p>
        <p className="flex items-center text-green-600 dark:text-green-400 mt-2">
          <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Diproses secara lokal di perangkat Anda
        </p>
      </div>
    </div>
  );
}
