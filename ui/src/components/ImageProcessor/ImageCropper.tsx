import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import styles from './assets/ImageProcessor.module.css';

interface ImageCropperProps {
  imageToCrop: string;
  width: number;
  height: number;
  cropScale: number;
  onImageCropped: (croppedImage: HTMLImageElement) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageToCrop, width, height, cropScale, onImageCropped }) => {
  const [cropConfig, setCropConfig] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageToCrop;
    img.onload = () => {
      setImageDimensions({
        width: img.width,
        height: img.height,
      });
    };
  }, [imageToCrop]);

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

  useEffect(() => {
    if (imageDimensions) {
      setCropConfig((prev) => ({
        ...prev,
        width: width,
        height: height,
        x: 0,
        y: 0
      }));
    }
  }, [imageDimensions]);

  useEffect(() => {
    if (imageDimensions) {
      setCropConfig({
        unit: 'px',
        x: 0,
        y: 0,
        width: width,
        height: height
      });
    }
  }, [imageDimensions]);

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

  return (
    <div className={styles.canvasContainer} ref={containerRef}>
      <ReactCrop
        crop={cropConfig}
        onChange={(newCropConfig) => setCropConfig(newCropConfig)}
        onComplete={cropImage}
        aspect={cropScale}
        ruleOfThirds
      >
        <img
          src={imageToCrop}
          width={width}
          height={height}
          ref={imageRef}
          alt="Crop me"
        />
      </ReactCrop>
    </div>
  );
};

export default ImageCropper;
