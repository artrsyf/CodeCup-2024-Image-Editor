import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
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
    unit: 'px',
    x: 0,
    y: 0,
    width: width,
    height: height,
  });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Загружаем изображение и устанавливаем размеры
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

  // // Обновляем размеры обрезки при изменении размера контейнера или масштаба
  // useEffect(() => {
  //     if (cropScale == 1) {
  //       const cropWidth = height;
  //       const cropHeight = height
  //       setCropConfig((prev) => ({
  //         unit: 'px',
  //         x: 0,
  //         y: 0,
  //         width: cropWidth,
  //         height: cropHeight,
  //       }));
  //     } else if (cropScale == -1) {
  //       const cropWidth = width;
  //       const cropHeight = height
  //       setCropConfig((prev) => ({
  //         unit: 'px',
  //         x: 0,
  //         y: 0,
  //         width: cropWidth,
  //         height: cropHeight,
  //       }));
  //     } else {
  //       const cropWidth = width;
  //       const cropHeight = width / cropScale;
  //       setCropConfig((prev) => ({
  //         unit: 'px',
  //         x: 0,
  //         y: 0,
  //         width: cropWidth,
  //         height: cropHeight,
  //       }));
  //     }
      

  // }, [containerSize, cropScale]);

  // Функция для обрезки изображения
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
    setCropConfig((prev) => ({
      ...prev,
      cropScale,
      width: prev.width,
      height: prev.width / cropScale,
    }));
  }, [cropScale]);

  // Функция для получения обрезанного изображения
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