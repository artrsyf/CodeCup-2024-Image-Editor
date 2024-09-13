import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import styles from './assets/ImageProcessor.module.css';

interface ImageCropperProps {
  imageToCrop: string;
  cropScale: number;
  onImageCropped: (croppedImage: HTMLImageElement) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageToCrop, cropScale, onImageCropped }) => {
  const [cropConfig, setCropConfig] = useState<Crop>({
    unit: 'px',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Ref to track initialization to avoid re-running on mount
  const initializedRef = useRef(false);

  const cropImage = useCallback(
    async (crop: PixelCrop) => {
      if (imageRef.current && crop.width && crop.height) {
        try {
          const croppedImage = await getCroppedImage(imageRef.current, crop);
          onImageCropped(croppedImage);
        } catch (error) {
          console.error('Error cropping image:', error);
        }
      }
    },
    [onImageCropped]
  );

  const getCroppedImage = (
    sourceImage: HTMLImageElement,
    cropConfig: PixelCrop
  ): Promise<HTMLImageElement> => {
    const canvas = document.createElement('canvas');
    const scaleX = sourceImage.naturalWidth / sourceImage.width;
    const scaleY = sourceImage.naturalHeight / sourceImage.height;
    canvas.width = cropConfig.width;
    canvas.height = cropConfig.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return Promise.reject(new Error('Failed to get 2D context'));
    }

    ctx.drawImage(
      sourceImage,
      cropConfig.x * scaleX,
      cropConfig.y * scaleY,
      cropConfig.width * scaleX,
      cropConfig.height * scaleY,
      0,
      0,
      cropConfig.width,
      cropConfig.height
    );

    return new Promise((resolve, reject) => {
      const newImage = new Image();
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }

          newImage.src = window.URL.createObjectURL(blob);
          newImage.onload = () => resolve(newImage);
        },
        'image/jpeg',
        1
      );
    });
  };

  const onImageLoaded = (image: HTMLImageElement) => {
    imageRef.current = image;
    setImageDimensions({
      width: image.width,
      height: image.height,
    });
  };

  useEffect(() => {
    if (initializedRef.current) return; // Prevent rerun after first render
    if (imageDimensions) {
      initializedRef.current = true; // Mark as initialized

      let width = imageDimensions.width;
      let height = imageDimensions.height;

      if (cropScale === 1) {
        const size = Math.min(width, height);
        width = size;
        height = size;
      } else {
        height = width / cropScale;
      }

      const initialCrop: PixelCrop = {
        unit: 'px',
        x: 0,
        y: 0,
        width,
        height,
      };

      setCropConfig(initialCrop);
      cropImage(initialCrop); // This is only called once when imageDimensions is set
    }
  }, [imageDimensions, cropScale, cropImage]);

  return (
    <ReactCrop
      crop={cropConfig}
      onChange={(newCropConfig) => setCropConfig(newCropConfig)}
      onComplete={(finalCrop) => {
        if (finalCrop.width && finalCrop.height) {
          cropImage(finalCrop);
        }
      }}
      ruleOfThirds
    >
      <div className={styles.canvasContainer}>
        <img
          src={imageToCrop}
          className={styles.uploadedImage}
          ref={imageRef}
          onLoad={(e) => onImageLoaded(e.currentTarget)}
          alt="Crop me"
          style={{ maxWidth: '100%' }}
        />
      </div>
    </ReactCrop>
  );
};

export default ImageCropper;
