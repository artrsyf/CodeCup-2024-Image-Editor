import React, { useEffect, useRef, useState } from 'react';
import styles from "./assets/ImageProcessor.module.css"
interface ResizeToolProps {
  imageSrc: string;
  width: number;
  height: number;
  preserveAspectRatio: boolean;
  onImageResized: (resizedImage: HTMLImageElement) => void;
}

const ResizeTool: React.FC<ResizeToolProps> = ({
  imageSrc,
  width,
  height,
  preserveAspectRatio,
  onImageResized,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [resizedImageSrc, setResizedImageSrc] = useState<string>(imageSrc);
  const [initialSize, setInitialSize] = useState({
    width: width,
    height: height,
    preserveAspectRatio: preserveAspectRatio,
  })

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;

      // Draw the resized image on the canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to image source
      const newImageSrc = canvas.toDataURL('image/jpeg');
      setResizedImageSrc(newImageSrc); // Update state to show the resized image

      const isModified = 
        width !== initialSize.width || 
        height !== initialSize.height || 
        preserveAspectRatio !== initialSize.preserveAspectRatio;

      if (isModified) {
        const newImage = new Image();
        newImage.src = newImageSrc;

        // Callback для обновления изображения в родительском компоненте
        onImageResized(newImage);

        // Сохраняем текущие настройки как исходные
        setInitialSize({
          width,
          height,
          preserveAspectRatio,
        });
      };
    };
  }, [imageSrc, width, height, preserveAspectRatio, onImageResized]);

  return (
    <div className={styles.canvasContainer}>
      {/* Visible image showing the resized result */}
      <img 
        src={resizedImageSrc} 
        alt="Resized"
        className={`${preserveAspectRatio ? styles.saveConstrainResizeImage : ""}`}
        height={height}
        width={width}
      />  

      {/* Hidden canvas for resizing processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ResizeTool;
