export interface CompressedImage {
  dataUrl: string;
  width: number;
  height: number;
  size: number;
}

export class ImageCompressor {
  static async compressImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 600,
    quality: number = 0.8
  ): Promise<CompressedImage> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // アスペクト比を保持してリサイズ
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // 圧縮してDataURLに変換
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // サイズを計算
          const size = Math.round((dataUrl.length * 3) / 4);
          
          resolve({
            dataUrl,
            width,
            height,
            size
          });
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  static async compressImageFromDataUrl(
    dataUrl: string,
    maxWidth: number = 800,
    maxHeight: number = 600,
    quality: number = 0.8
  ): Promise<CompressedImage> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // アスペクト比を保持してリサイズ
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // 圧縮してDataURLに変換
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // サイズを計算
          const size = Math.round((compressedDataUrl.length * 3) / 4);
          
          resolve({
            dataUrl: compressedDataUrl,
            width,
            height,
            size
          });
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = dataUrl;
    });
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
