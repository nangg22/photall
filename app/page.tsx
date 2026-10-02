import { Header } from "@/components/layout/header";
import { UploadArea } from "@/components/upload/upload-area";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-24">
        <div className="w-full max-w-3xl flex flex-col items-center space-y-8 text-center">
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Edit Gambar Anda. <span className="text-primary">Gratis.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hapus latar belakang, tingkatkan kualitas, ubah ukuran, dan ekspor.
              Semuanya diproses langsung di peramban Anda.
            </p>
          </div>

          <div className="w-full max-w-xl mt-8">
            <UploadArea />
          </div>

        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-auto">
        <p>
          Photall — Proyek Open Source. Dibuat tanpa menyimpan data Anda.
        </p>
      </footer>
    </div>
  );
}
