import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';

import styles from './assets/ImageProcessor.module.css';

interface FilterToolProps {
    imageSrc: string;
    width: number;
    height: number;
    selectedFilter: string | null;
    isPreview: boolean;
    onImageFiltered: (newImage: HTMLImageElement) => void;
}

const FilterTool: React.FC<FilterToolProps> = ({
    imageSrc,
    width,
    height,
    selectedFilter,
    isPreview,
    onImageFiltered
}) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const imageRef = useRef<Konva.Image>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [filterApplied, setFilterApplied] = useState<boolean>(false); // Новое состояние

    useEffect(() => {
        const img = new window.Image();
        img.src = imageSrc;
        img.onload = () => {
            setImage(img);
            setImageLoaded(true);
        };
    }, [imageSrc]);

    const applyFilter = () => {
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
            imageNode.getLayer()?.batchDraw();

            setFilterApplied(true);
        }
    };

    useEffect(() => {
      applyFilter();
    }, [selectedFilter]);

    useEffect(() => {
        if (image && stageRef.current && filterApplied && !isPreview) {
            const stage = stageRef.current;
            const dataURL = stage.toDataURL({ pixelRatio: 3 });
            const newImage = new Image();
            newImage.src = dataURL;

            newImage.onload = () => {
                onImageFiltered(newImage);
            };

            setFilterApplied(false);
        }
    }, [filterApplied, image, selectedFilter, isPreview]);

    return (
        <div className={styles.canvasContainer} style={isPreview ? { width: '74px', height: '74px' } : {}}>
            {imageLoaded ? (
                <Stage width={width} height={height} ref={stageRef}>
                    <Layer>
                        {image && (
                            <KonvaImage
                                image={image}
                                ref={imageRef}
                                width={width}
                                height={height}
                                filters={
                                    isPreview && selectedFilter
                                        ? (selectedFilter === 'grayscale'
                                            ? [Konva.Filters.Grayscale]
                                            : selectedFilter === 'sepia'
                                            ? [Konva.Filters.Sepia]
                                            : selectedFilter === 'vintage'
                                            ? [Konva.Filters.Sepia, Konva.Filters.Contrast, Konva.Filters.HSL]
                                            : [])
                                        : [] // Если нет превью или фильтра, не применяем фильтры
                                }
                                {...(selectedFilter === 'vintage' && isPreview
                                    ? {
                                        contrast: -0.1,
                                        saturation: -0.3,
                                        hue: 20,
                                    }
                                    : {}
                                )}
                                cache
                            />
                        )}
                    </Layer>
                </Stage>
            ) : (
                <div className={styles.loader}>Загрузка...</div>
            )}
        </div>
    );
};

export default FilterTool;
