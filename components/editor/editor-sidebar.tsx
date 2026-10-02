"use client";

import { useState, useEffect } from "react";
import { 
  Wand2, 
  Image as ImageIcon, 
  Crop, 
  Download,
  Settings2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useEditor } from "@/contexts/editor-context";

export function EditorSidebar() {
  const { 
    brightness, setBrightness, 
    contrast, setContrast, 
    exportImage, 
    isCropping, setIsCropping, 
    aspectRatio, setAspectRatio, 
    applyCrop,
    isBgProcessing, bgLoadingMessage, removeBackground,
    backgroundColor, setBackgroundColor,
    originalFileSize, canvasRef
  } = useEditor();
  const [exportFormat, setExportFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [exportQuality, setExportQuality] = useState(90);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);

  // Calculate estimated file size
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Create a small debounce/timeout to avoid freezing the UI too often
    const timeout = setTimeout(() => {
      canvas.toBlob((blob) => {
        if (blob) setEstimatedSize(blob.size);
      }, exportFormat, exportFormat === "image/png" ? undefined : exportQuality / 100);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [exportFormat, exportQuality, canvasRef.current, brightness, contrast, backgroundColor]); // also update when image changes, but those are handled by canvas updates usually

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleRemoveBackground = () => {
    removeBackground();
  };

  const handleExport = () => {
    toast.success(`Mengekspor gambar sebagai ${exportFormat.split("/")[1].toUpperCase()}...`);
    exportImage(exportFormat, exportQuality / 100);
  };

  return (
    <div className="p-4 flex flex-col h-full overflow-hidden">
      <h2 className="font-semibold mb-4 text-lg hidden lg:block">Alat Edit</h2>
      
      <Tabs defaultValue="background" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-5 w-full mb-4 shrink-0">
          <TabsTrigger value="background" title="Latar Belakang"><ImageIcon className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="adjust" title="Penyesuaian"><Settings2 className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="crop" title="Potong"><Crop className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="presets" title="Template"><Wand2 className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="export" title="Ekspor"><Download className="h-4 w-4" /></TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4">
          {/* Presets Tools */}
          <TabsContent value="presets" className="m-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Template Instan</CardTitle>
                <CardDescription>Format siap pakai untuk berbagai kebutuhan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Kebutuhan Pelajar & Kerja</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" className="justify-start text-left h-auto py-2" onClick={() => {
                      setAspectRatio("3:4-pasfoto");
                      setBackgroundColor("#dc2626"); // Red by default
                      setIsCropping(true);
                      toast.info("Rasio 3:4 & Latar Merah diterapkan. Silakan sesuaikan crop lalu klik Terapkan.");
                    }}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Pas Foto Merah (3x4)</span>
                        <span className="text-xs text-muted-foreground">Untuk ijazah & dokumen resmi</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start text-left h-auto py-2" onClick={() => {
                      setAspectRatio("3:4-pasfoto");
                      setBackgroundColor("#3b82f6"); // Blue
                      setIsCropping(true);
                      toast.info("Rasio 3:4 & Latar Biru diterapkan. Silakan sesuaikan crop lalu klik Terapkan.");
                    }}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Pas Foto Biru (3x4)</span>
                        <span className="text-xs text-muted-foreground">Untuk buku nikah & KTP</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start text-left h-auto py-2" onClick={() => {
                      setAspectRatio("1:1");
                      setBackgroundColor("white");
                      setIsCropping(true);
                      toast.info("Rasio 1:1 & Latar Putih diterapkan. Silakan sesuaikan crop lalu klik Terapkan.");
                    }}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Foto Profil Profesional</span>
                        <span className="text-xs text-muted-foreground">Untuk CV & LinkedIn (Persegi)</span>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <h4 className="text-sm font-medium">Media Sosial</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setAspectRatio("1:1");
                      setIsCropping(true);
                    }}>IG Square (1:1)</Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setAspectRatio("3:4");
                      setIsCropping(true);
                    }}>IG Portrait (4:5)</Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setAspectRatio("9:16");
                      setIsCropping(true);
                    }}>Story (9:16)</Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setAspectRatio("16:9");
                      setIsCropping(true);
                    }}>YouTube (16:9)</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Background Tools */}
          <TabsContent value="background" className="m-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Latar Belakang</CardTitle>
                <CardDescription>Hapus atau ganti latar gambar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full flex gap-2" 
                  onClick={handleRemoveBackground}
                  disabled={isBgProcessing}
                >
                  <Wand2 className={`h-4 w-4 ${isBgProcessing ? "animate-spin" : ""}`} />
                  {isBgProcessing ? bgLoadingMessage || "Memproses..." : "Hapus Latar Belakang"}
                </Button>
                
                <div className="pt-4 border-t space-y-3">
                  <h4 className="text-sm font-medium">Warna Pengganti</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setBackgroundColor("transparent")}
                      className={`w-8 h-8 rounded-full border border-dashed border-muted-foreground bg-transparent flex items-center justify-center focus:ring-2 ring-primary ring-offset-2 overflow-hidden ${backgroundColor === "transparent" ? "ring-2" : ""}`} 
                      title="Transparan"
                    >
                      <div className="w-full h-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgfQEh/48b/iMyGYRgYMA5AwzCAi4+OaXQDGEY3gLEaGD2NQZ4GAAC8Ww/7s+gXDAAAAABJRU5ErkJggg==')]"></div>
                    </button>
                    <button onClick={() => setBackgroundColor("white")} className={`w-8 h-8 rounded-full border bg-white focus:ring-2 ring-primary ring-offset-2 ${backgroundColor === "white" ? "ring-2" : ""}`} title="Putih"></button>
                    <button onClick={() => setBackgroundColor("black")} className={`w-8 h-8 rounded-full border bg-black focus:ring-2 ring-primary ring-offset-2 ${backgroundColor === "black" ? "ring-2" : ""}`} title="Hitam"></button>
                    <button onClick={() => setBackgroundColor("#3b82f6")} className={`w-8 h-8 rounded-full border bg-blue-500 focus:ring-2 ring-primary ring-offset-2 ${backgroundColor === "#3b82f6" ? "ring-2" : ""}`} title="Biru (Pas Foto)"></button>
                    <button onClick={() => setBackgroundColor("#dc2626")} className={`w-8 h-8 rounded-full border bg-red-600 focus:ring-2 ring-primary ring-offset-2 ${backgroundColor === "#dc2626" ? "ring-2" : ""}`} title="Merah (Pas Foto)"></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Adjustment Tools */}
          <TabsContent value="adjust" className="m-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Penyesuaian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <label>Kecerahan</label>
                    <span className="text-muted-foreground">{brightness}%</span>
                  </div>
                  <Slider 
                    value={[brightness]} 
                    onValueChange={(val) => setBrightness(val[0])}
                    max={100} min={-100} step={1} 
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <label>Kontras</label>
                    <span className="text-muted-foreground">{contrast}%</span>
                  </div>
                  <Slider 
                    value={[contrast]} 
                    onValueChange={(val) => setContrast(val[0])}
                    max={100} min={-100} step={1} 
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => {
                    setBrightness(0);
                    setContrast(0);
                  }}
                >
                  Reset
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crop Tools */}
          <TabsContent value="crop" className="m-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Potong (Crop)</CardTitle>
                <CardDescription>Pilih rasio lalu sesuaikan area</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { label: "Bebas", value: "free" },
                    { label: "1:1 (Persegi)", value: "1:1" },
                    { label: "3:4 (Pas Foto)", value: "3:4-pasfoto" },
                    { label: "4:3 (Lanskap)", value: "4:3" },
                    { label: "16:9 (Layar)", value: "16:9" },
                    { label: "9:16 (Story)", value: "9:16" },
                  ] as const).map((item) => (
                    <Button
                      key={item.value}
                      variant={aspectRatio === item.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAspectRatio(item.value)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  {!isCropping ? (
                    <Button className="flex-1" onClick={() => setIsCropping(true)}>
                      <Crop className="mr-2 h-4 w-4" /> Mulai Crop
                    </Button>
                  ) : (
                    <>
                      <Button className="flex-1" onClick={applyCrop}>
                        Terapkan
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setIsCropping(false)}>
                        Batal
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tools */}
          <TabsContent value="export" className="m-0 space-y-4">
             <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Pengaturan Ekspor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={exportFormat === "image/png" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setExportFormat("image/png")}
                    >PNG</Button>
                    <Button 
                      variant={exportFormat === "image/jpeg" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setExportFormat("image/jpeg")}
                    >JPG</Button>
                    <Button 
                      variant={exportFormat === "image/webp" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setExportFormat("image/webp")}
                    >WEBP</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <label className="font-medium">Kualitas Gambar</label>
                    <span className="text-muted-foreground">{exportQuality}%</span>
                  </div>
                  <Slider 
                    value={[exportQuality]} 
                    onValueChange={(val) => setExportQuality(val[0])}
                    disabled={exportFormat === "image/png"} // PNG is lossless by default in most canvas implementations
                    max={100} min={10} step={5} 
                  />
                  {exportFormat === "image/png" && (
                    <p className="text-xs text-muted-foreground">Kualitas tidak berlaku untuk format PNG.</p>
                  )}
                </div>

                <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ukuran Asli:</span>
                    <span className="font-medium">{originalFileSize > 0 ? formatSize(originalFileSize) : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimasi Hasil:</span>
                    <span className={`font-medium ${estimatedSize && originalFileSize && estimatedSize < originalFileSize ? 'text-green-600 dark:text-green-400' : ''}`}>
                      {estimatedSize ? formatSize(estimatedSize) : "Menghitung..."}
                    </span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" /> Unduh Gambar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
