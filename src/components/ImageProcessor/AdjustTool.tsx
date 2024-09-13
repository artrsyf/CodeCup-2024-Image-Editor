import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import styles from './assets/ImageProcessor.module.css';

interface AdjustToolProps {
  imageSrc: string;
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  onImageAdjusted: (newImage: HTMLImageElement) => void;
}

const AdjustTool: React.FC<AdjustToolProps> = ({ imageSrc, brightness, contrast, saturation, exposure, onImageAdjusted }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const imageRef = useRef<Konva.Image>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Получаем размеры контейнера и устанавливаем размер канваса
  const updateSize = () => {
    const container = document.querySelector(`.${styles.canvasContainer}`) as HTMLElement;
    if (container && image) {
      const containerHeight = container.clientHeight;
      const imgAspectRatio = image.width / image.height;
      const newWidth = containerHeight * imgAspectRatio;
      setStageSize({
        width: Math.max(newWidth, container.clientWidth), // Убедитесь, что ширина не меньше ширины контейнера
        height: containerHeight,
      });
    }
  };

  // Обновляем размер при изменении окна
  useLayoutEffect(() => {
    window.addEventListener('resize', updateSize);
    updateSize(); // Инициальное обновление размера

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [image]);

  // Загружаем изображение
  useEffect(() => {
    const img = new window.Image();
    img.src = imageSrc;
    setImage(img);
    setImageLoaded(true); // Устанавливаем флаг загрузки в true
    updateSize(); // Обновляем размер после загрузки изображения
  }, [imageSrc]);

  // Применяем фильтры и обновляем изображение
  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.cache();
      imageRef.current.filters([Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL]);
      imageRef.current.brightness(brightness);
      imageRef.current.contrast(contrast);
      imageRef.current.hue(saturation * 180); // Конвертация насыщенности в диапазон HSL
      imageRef.current.saturation(exposure - 1); // Коррекция экспозиции
      imageRef.current.draw();
    }
  }, [brightness, contrast, saturation, exposure]);

  // Генерация скорректированного изображения
  useEffect(() => {
    if (image && stageRef.current) {
      const stage = stageRef.current;
      const dataURL = stage.toDataURL({ pixelRatio: 3 }); // Картинка высокого качества
      const newImage = new Image();
      newImage.src = dataURL;

      newImage.onload = () => {
        onImageAdjusted(newImage);
      };
    }
  }, [image, brightness, contrast, saturation, exposure, onImageAdjusted]);

  return (
    <div className={styles.canvasContainer}>
      {imageLoaded && stageSize.width > 0 && stageSize.height > 0 ? (
        <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                ref={imageRef}
                width={stageSize.width}
                height={stageSize.height}
              />
            )}
          </Layer>
        </Stage>
      ) : (
        <div className={styles.loader}>Загрузка...</div> // Загрузка или спиннер
      )}
    </div>
  );
};

export default AdjustTool;
