import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageToCrop: string;
  cropScale: number;
  onImageCropped: (croppedImageUrl: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageToCrop, cropScale, onImageCropped }) => {
  const [cropConfig, setCropConfig] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Функция для обрезки изображения
  const cropImage = useCallback(async (crop: PixelCrop) => {
    if (imageRef.current && crop.width && crop.height) {
      try {
        const croppedImage = await getCroppedImage(
          imageRef.current,
          crop,
          'croppedImage.jpeg'
        );

        onImageCropped(croppedImage);
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  }, [onImageCropped]);

  // Функция для получения обрезанного изображения
  const getCroppedImage = (
    sourceImage: HTMLImageElement,
    cropConfig: PixelCrop,
    fileName: string
  ): Promise<string> => {
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
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }

          const croppedImageUrl = window.URL.createObjectURL(blob);
          resolve(croppedImageUrl);
        },
        'image/jpeg',
        1
      );
    });
  };

  // Обработчик загрузки изображения
  const onImageLoaded = (image: HTMLImageElement) => {
    imageRef.current = image;
    setImageDimensions({
      width: image.width,
      height: image.height
    });
  };

  // Состояние обрезки изменяется в зависимости от размеров изображения
  useEffect(() => {
    if (imageDimensions) {
      setCropConfig({
        unit: 'px',
        x: 0,
        y: 0,
        width: imageDimensions.width,
        height: imageDimensions.height
      });
    }
  }, [imageDimensions]);

  // Изменение сетки обрезки в соответствии с соотношением сторон
  useEffect(() => {
    setCropConfig((prev) => ({
      ...prev,
      cropScale,
      width: prev.width,
      height: prev.width / cropScale
    }));
  }, [cropScale]);

  return (
    <ReactCrop
      crop={cropConfig}
      onChange={(newCropConfig) => setCropConfig(newCropConfig)}
      onComplete={cropImage}
      ruleOfThirds
    >
      <img
        src={imageToCrop}
        ref={imageRef}
        onLoad={() => onImageLoaded}
        alt="Crop me"
        style={{ maxWidth: '100%' }}
      />
    </ReactCrop>
  );
};

// Значения по умолчанию для пропсов
ImageCropper.defaultProps = {
  onImageCropped: () => {},
};

export default ImageCropper;
