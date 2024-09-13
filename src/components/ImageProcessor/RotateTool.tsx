import React, { useEffect, useRef, useState } from 'react';

import styles from "./assets/ImageProcessor.module.css"

interface RotateToolProps {
  imageSrc: string;
  width: number;
  height: number;
  rotateAngle: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  onImageRotated: (rotatedImage: HTMLImageElement) => void;
}

const RotateTool: React.FC<RotateToolProps> = ({
  imageSrc,
  width,
  height,
  rotateAngle,
  flipHorizontal,
  flipVertical,
  onImageRotated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotatedImageSrc, setRotatedImageSrc] = useState<string>(imageSrc);
  const [initialRotation, setInitialRotation] = useState({
    rotateAngle: 0,
    flipHorizontal: false,
    flipVertical: false,
  })

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

    //   const width = width;
    //   const height = img.height;

      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height); // Clear the canvas
      ctx.save();

      // Translate to the center of the canvas
      ctx.translate(width / 2, height / 2);
      // Apply rotation and flip transformations
      ctx.rotate((rotateAngle * Math.PI) / 180);
      ctx.scale(flipVertical ? -1 : 1, flipHorizontal ? -1 : 1);

      // Draw the rotated image
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      ctx.restore();

      // Convert canvas to image source
      const newImageSrc = canvas.toDataURL('image/jpeg');
      setRotatedImageSrc(newImageSrc); // Update state to show the rotated image

      const isModified = 
      rotateAngle !== initialRotation.rotateAngle || 
      flipHorizontal !== initialRotation.flipHorizontal || 
      flipVertical !== initialRotation.flipVertical;

    // Если изменения были, создаем новое изображение и вызываем onImageRotated
      if (isModified) {
        const newImage = new Image();
        newImage.src = newImageSrc;

        // Callback для обновления изображения в родительском компоненте
        onImageRotated(newImage);

        // Сохраняем текущие настройки как исходные
        setInitialRotation({
          rotateAngle,
          flipHorizontal,
          flipVertical,
        });
      };
    };
  }, [rotateAngle, flipHorizontal, flipVertical]);

  return (
    <div className={styles.canvasContainer}>
      {/* Visible image showing the rotated result */}
      <img src={rotatedImageSrc} alt="Rotated" />

      {/* Hidden canvas for rotating processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default RotateTool;
