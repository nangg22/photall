import { env, pipeline, type PipelineType, type ProgressCallback } from '@huggingface/transformers';

// Skip local model check since we want to download from HF hub
env.allowLocalModels = false;

class BackgroundRemovalPipeline {
  static task: PipelineType = 'image-segmentation';
  static model = 'briaai/RMBG-1.4';
  static instance: any = null;

  static async getInstance(progress_callback: ProgressCallback) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, {
        progress_callback,
        device: 'webgpu',
      });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const { action, imageUrl } = event.data;
  
  if (action === 'remove-background') {
    try {
      self.postMessage({ status: 'loading', message: 'Memuat model AI...' });

      const segmenter = await BackgroundRemovalPipeline.getInstance((x: any) => {
        // Send progress (download progress) back
        self.postMessage({ status: 'progress', data: x });
      });

      self.postMessage({ status: 'processing', message: 'Menghapus latar belakang...' });

      // Run inference
      const result = await segmenter(imageUrl);
      
      // result could be a RawImage or an array of { mask, label }
      const maskData = Array.isArray(result) ? (result.find((x: any) => x.label === 'foreground' || x.label === 'LABEL_1')?.mask || result[0]?.mask) : result;
      
      if (!maskData) {
         throw new Error("Gagal mengekstrak mask dari model.");
      }
      
      // Send the mask data back to the main thread
      // We pass the raw pixel data, width, and height.
      self.postMessage({ 
        status: 'complete', 
        mask: {
          data: maskData.data, // Uint8Array or Float32Array
          width: maskData.width,
          height: maskData.height,
        } 
      });
      
    } catch (error: any) {
      console.error(error);
      self.postMessage({ status: 'error', message: error.message || error.toString() });
    }
  }
});
