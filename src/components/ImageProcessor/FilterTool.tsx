import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';

import styles from './assets/ImageProcessor.module.css';

interface FilterToolProps {
    imageSrc: string;
    selectedFilter: string | null;
    onImageFiltered: (newImage: HTMLImageElement) => void;
}

const FilterTool: React.FC<FilterToolProps> = ({ imageSrc, selectedFilter, onImageFiltered }) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const imageRef = useRef<Konva.Image>(null);
    const stageRef = useRef<Konva.Stage>(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = imageSrc;
        img.onload = () => setImage(img);
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
    }, [image, selectedFilter, onImageFiltered]);

    return (
        <div className={styles.adjustTool}>
            <Stage width={500} height={500} ref={stageRef}>
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
