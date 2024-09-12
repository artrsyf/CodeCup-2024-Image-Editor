import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';

import styles from './assets/ImageProcessor.module.css';

interface FilterToolProps {
    imageSrc: string;
    selectedFilter: string | null;
}

const FilterTool: React.FC<FilterToolProps> = ({ imageSrc, selectedFilter }) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const imageRef = useRef<Konva.Image>(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = imageSrc;
        img.onload = () => setImage(img);
      }, [imageSrc]);


    useEffect(() => {
    if (imageRef.current) {
        const filters = [];
        if (selectedFilter === 'grayscale') {
            filters.push(Konva.Filters.Grayscale);
        } else if (selectedFilter === 'sepia') {
            filters.push(Konva.Filters.Sepia);
        } else if (selectedFilter === 'vintage') {
            filters.push(Konva.Filters.Sepia);
            filters.push(Konva.Filters.Contrast);
            filters.push(Konva.Filters.HSL);
            imageRef.current.contrast(-0.1);
            imageRef.current.saturation(-0.3);
            imageRef.current.hue(20);
        }

        imageRef.current.filters(filters);
        imageRef.current.cache();
        imageRef.current.draw();
    }
    }, [selectedFilter]);

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

export default FilterTool;