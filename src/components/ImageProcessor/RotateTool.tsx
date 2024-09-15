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

      // Calculate the angle in radians
      const angleInRadians = (rotateAngle * Math.PI) / 180;
      const cos = Math.abs(Math.cos(angleInRadians));
      const sin = Math.abs(Math.sin(angleInRadians));

      // Calculate the new width and height based on the rotation
      const newWidth = width * cos + height * sin;
      const newHeight = width * sin + height * cos;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Calculate scale factor to fit the rotated image within canvas
      const scaleX = newWidth / width;
      const scaleY = newHeight / height;
      const scale = Math.min(scaleX, scaleY);

      ctx.clearRect(0, 0, newWidth, newHeight); // Clear the canvas
      ctx.save();

      // Translate to the center of the canvas
      ctx.translate(newWidth / 2, newHeight / 2);
      // Apply rotation and flip transformations
      ctx.rotate(angleInRadians);
      ctx.scale(flipVertical ? -1 : 1, flipHorizontal ? -1 : 1);

      // Draw the rotated and scaled image
      ctx.drawImage(img, -width / 2 * scale, -height / 2 * scale, width * scale, height * scale);
      ctx.restore();

      // Convert canvas to image source
      const newImageSrc = canvas.toDataURL('image/jpeg');
      setRotatedImageSrc(newImageSrc); // Update state to show the rotated image

      const isModified =
        rotateAngle !== initialRotation.rotateAngle ||
        flipHorizontal !== initialRotation.flipHorizontal ||
        flipVertical !== initialRotation.flipVertical;

      // If modified, create a new image and call onImageRotated
      if (isModified) {
        const newImage = new Image();
        newImage.src = newImageSrc;

        // Callback to update the image in the parent component
        onImageRotated(newImage);

        // Save current settings as initial
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
      {/* Visible image showing the rotated result */}
      <img src={rotatedImageSrc} alt="Rotated" />

      {/* Hidden canvas for rotating processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default RotateTool;
