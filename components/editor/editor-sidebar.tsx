"use client";

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

export function EditorSidebar() {
  const handleRemoveBackground = () => {
    toast.info("Fitur Hapus Latar Belakang belum terintegrasi dengan AI (Tahap 3).");
  };

  const handleExport = () => {
    toast.success("Mempersiapkan gambar untuk diunduh...");
    // TODO: Implement Canvas API export
  };

  return (
    <div className="p-4 flex flex-col h-full overflow-hidden">
      <h2 className="font-semibold mb-4 text-lg hidden lg:block">Alat Edit</h2>
      
      <Tabs defaultValue="background" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-4 w-full mb-4 shrink-0">
          <TabsTrigger value="background"><ImageIcon className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="adjust"><Settings2 className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="crop"><Crop className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="export"><Download className="h-4 w-4" /></TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4">
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
                >
                  <Wand2 className="h-4 w-4" />
                  Hapus Latar Belakang
                </Button>
                
                <div className="pt-4 border-t space-y-3">
                  <h4 className="text-sm font-medium">Warna Pengganti</h4>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full border border-dashed border-muted-foreground bg-transparent flex items-center justify-center focus:ring-2 ring-primary ring-offset-2 overflow-hidden" title="Transparan">
                      <div className="w-full h-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgfQEh/48b/iMyGYRgYMA5AwzCAi4+OaXQDGEY3gLEaGD2NQZ4GAAC8Ww/7s+gXDAAAAABJRU5ErkJggg==')]"></div>
                    </button>
                    <button className="w-8 h-8 rounded-full border bg-white focus:ring-2 ring-primary ring-offset-2" title="Putih"></button>
                    <button className="w-8 h-8 rounded-full border bg-black focus:ring-2 ring-primary ring-offset-2" title="Hitam"></button>
                    <button className="w-8 h-8 rounded-full border bg-blue-500 focus:ring-2 ring-primary ring-offset-2" title="Biru (Pas Foto)"></button>
                    <button className="w-8 h-8 rounded-full border bg-red-600 focus:ring-2 ring-primary ring-offset-2" title="Merah (Pas Foto)"></button>
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
                    <span className="text-muted-foreground">0%</span>
                  </div>
                  <Slider defaultValue={[0]} max={100} min={-100} step={1} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <label>Kontras</label>
                    <span className="text-muted-foreground">0%</span>
                  </div>
                  <Slider defaultValue={[0]} max={100} min={-100} step={1} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crop Tools */}
          <TabsContent value="crop" className="m-0 space-y-4">
             <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Potong (Crop)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm">Bebas</Button>
                  <Button variant="outline" size="sm">1:1 (Persegi)</Button>
                  <Button variant="outline" size="sm">3:4 (Pas Foto)</Button>
                  <Button variant="outline" size="sm">16:9 (Layar)</Button>
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
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="secondary" size="sm">PNG</Button>
                    <Button variant="outline" size="sm">JPG</Button>
                    <Button variant="outline" size="sm">WEBP</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kualitas Gambar</label>
                  <Slider defaultValue={[90]} max={100} min={10} step={5} />
                  <p className="text-xs text-right text-muted-foreground">90%</p>
                </div>
                <Button className="w-full mt-2" size="lg" onClick={handleExport}>
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
