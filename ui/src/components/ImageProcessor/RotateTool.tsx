import React, { useEffect, useRef, useState } from 'react';

import styles from "./assets/ImageProcessor.module.css";

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
  });

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const angleInRadians = (rotateAngle * Math.PI) / 180;
      const cos = Math.abs(Math.cos(angleInRadians));
      const sin = Math.abs(Math.sin(angleInRadians));

      const newWidth = width * cos + height * sin;
      const newHeight = width * sin + height * cos;

      canvas.width = newWidth;
      canvas.height = newHeight;

      const scaleX = newWidth / width;
      const scaleY = newHeight / height;
      const scale = Math.min(scaleX, scaleY);

      ctx.clearRect(0, 0, newWidth, newHeight);
      ctx.save();

      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(angleInRadians);
      ctx.scale(flipVertical ? -1 : 1, flipHorizontal ? -1 : 1);

      ctx.drawImage(img, -width / 2 * scale, -height / 2 * scale, width * scale, height * scale);
      ctx.restore();

      const newImageSrc = canvas.toDataURL('image/jpeg');
      setRotatedImageSrc(newImageSrc);

      const isModified =
        rotateAngle !== initialRotation.rotateAngle ||
        flipHorizontal !== initialRotation.flipHorizontal ||
        flipVertical !== initialRotation.flipVertical;

      if (isModified) {
        const newImage = new Image();
        newImage.src = newImageSrc;

        onImageRotated(newImage);

        setInitialRotation({
          rotateAngle,
          flipHorizontal,
          flipVertical,
        });
      }
    };
  }, [rotateAngle, flipHorizontal, flipVertical, imageSrc]);

  return (
    <div className={styles.canvasContainer}>
      <img src={rotatedImageSrc} alt="Rotated" />

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default RotateTool;
