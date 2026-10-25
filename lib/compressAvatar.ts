// lib/compressAvatar.ts
export async function compressAvatarImage(file: File, maxSize = 240, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = maxSize;
      canvas.height = maxSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context error"));

      // 居中正方形裁切
      const minEdge = Math.min(img.width, img.height);
      const sx = (img.width - minEdge) / 2;
      const sy = (img.height - minEdge) / 2;
      ctx.drawImage(img, sx, sy, minEdge, minEdge, 0, 0, maxSize, maxSize);

      // 輸出為極輕量的 WebP 格式 (通常僅 15KB ~ 35KB)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Image compression failed"));
        },
        "image/webp",
        quality
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}