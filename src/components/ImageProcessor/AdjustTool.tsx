import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import styles from './assets/ImageProcessor.module.css';

interface AdjustToolProps {
  imageSrc: string;
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
}

const AdjustTool: React.FC<AdjustToolProps> = ({ imageSrc, brightness, contrast, saturation, exposure }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const imageRef = useRef<Konva.Image>(null);

  // Загружаем изображение при первом рендере
  useEffect(() => {
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => setImage(img);
  }, [imageSrc]);

  // Обновление фильтров на изображении при изменении пропсов
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

  return (
    <div className={styles.adjustTool}>
      <Stage width={500} height={500}>
        <Layer>
          {image && (
            <KonvaImage
              image={image}
              ref={imageRef}
              width={500}
              height={500}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default AdjustTool;
