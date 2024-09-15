import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';

import styles from './assets/ImageProcessor.module.css';

interface FilterToolProps {
    imageSrc: string;
    selectedFilter: string | null;
    isPreview: boolean;
    onImageFiltered: (newImage: HTMLImageElement) => void;
}

const FilterTool: React.FC<FilterToolProps> = ({ imageSrc, selectedFilter, isPreview, onImageFiltered }) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const imageRef = useRef<Konva.Image>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [stageSize, setStageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);

    const updateSize = () => {
        const container = document.querySelector(`.${styles.canvasContainer}`) as HTMLElement;
        if (container && image) {
          if (isPreview) {
            console.log(1);
            setStageSize({
              width: 74,
              height: 74,
            });

            return;
          }

          const containerHeight = container.clientHeight;
          const imgAspectRatio = image.width / image.height;
          const newWidth = containerHeight * imgAspectRatio;
          setStageSize({
            width: newWidth, // Убедитесь, что ширина не меньше ширины контейнера
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

    useEffect(() => {
        if (imageRef.current) {
            const filters = [];
            const imageNode = imageRef.current;

            if (selectedFilter === 'grayscale') {
                filters.push(Konva.Filters.Grayscale);
            } else if (selectedFilter === 'sepia') {
                filters.push(Konva.Filters.Sepia);
            } else if (selectedFilter === 'vintage') {
                filters.push(Konva.Filters.Sepia);
                filters.push(Konva.Filters.Contrast);
                filters.push(Konva.Filters.HSL);
                imageNode.contrast(-0.1);
                imageNode.saturation(-0.3);
                imageNode.hue(20);
            }

            imageNode.filters(filters);
            imageNode.cache();
            imageNode.getLayer()?.batchDraw(); // Ensure the image is redrawn
        }
    }, [selectedFilter]);

    useEffect(() => {
        if (image && stageRef.current) {
            const stage = stageRef.current;
            const dataURL = stage.toDataURL({ pixelRatio: 3 }); // Increase image quality
            const newImage = new Image();
            newImage.src = dataURL;

            newImage.onload = () => {
                onImageFiltered(newImage);
            };
        }
    }, [image, selectedFilter]);

    return (
        <div className={styles.canvasContainer} style={isPreview ? { width: '74px', height: '74px' } : {}}>
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

export default FilterTool;
