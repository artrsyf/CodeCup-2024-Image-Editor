import React, { FC, useState, useCallback   } from 'react';
import ImageCropper from "./ImageCropper";
import AdjustTool from "./AdjustTool"
import AdjustSliders from "./AdjustSliders";
import styles from './assets/ImageProcessor.module.css';
import Canvas from "./Canvas"
import FilterTool from "./FilterTool"

interface ImageProcessorProps {
  imageSrc: string;
  onCancel: () => void;
}

const ImageProcessor: FC<ImageProcessorProps> = ({ imageSrc, onCancel }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const [imageToCrop, setImageToCrop] = useState(undefined);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState<number>(1);

  const [resizeWidth, setResizeWidth] = useState<number | ''>('');
  const [resizeHeight, setResizeHeight] = useState<number | ''>('');
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(true);

  const [rotateAngle, setRotateAngle] = useState<number>(0); // Для хранения угла поворота
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false); // Для горизонтального отражения
  const [flipVertical, setFlipVertical] = useState<boolean>(false); // Для вертикального отражения

  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [exposure, setExposure] = useState<number>(1);

  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleToolClick = (tool: string) => {
    setActiveTool(tool);
  };

  const handleScaleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const scale = parseFloat(event.target.value);
    setCropScale(scale);
  };

  const handleResizeWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResizeWidth(Number(event.target.value));
  };

  const handleResizeHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResizeHeight(Number(event.target.value));
  };

  const handleAspectRatioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreserveAspectRatio(event.target.checked);
  };

  const handleRotateRight = () => {
    setRotateAngle((prevAngle) => (prevAngle + 90) % 360);
  };

  // Функция для поворота влево (на -90 градусов)
  const handleRotateLeft = () => {
    setRotateAngle((prevAngle) => (prevAngle - 90 + 360) % 360);
  };

  // Функция для горизонтального отражения
  const handleFlipHorizontal = () => {
    setFlipHorizontal((prev) => !prev);
  };

  // Функция для вертикального отражения
  const handleFlipVertical = () => {
    setFlipVertical((prev) => !prev);
  };

  const applyFilter = (filter: string) => {
    setActiveFilter(filter);
  };

  // const handleResize = () => {
  //   if (resizeWidth && resizeHeight) {
  //     // Apply resizing logic based on the state
  //     // console.log('Resizing to:', resizeWidth, resizeHeight);
  //     // Here you would need to implement logic to resize the image
  //     // For example, you might pass these values to a resize function
  //     // and update the image accordingly
  //   }
  // };

  const renderRightPanel = () => {
    switch (activeTool) {
      case 'crop':
        return (
          <>
            <label htmlFor="scaleSelect" className={styles.scaleLabel}>
              Crop ratio
            </label>
            <select id="scaleSelect" onChange={handleScaleChange} className={styles.scaleSelect}>
              <option value="1">1:1</option>
              <option value="1.778">16:9</option>
              <option value="1.333">4:3</option>
            </select>
          </>
        );
      case 'resize':
        return (
          <div className={styles.resizeRightPanel}>
            <input
              type="number"
              value={resizeWidth}
              onChange={handleResizeWidthChange}
              placeholder="Width"
              className={styles.inputField}
            />
            <input
              type="number"
              value={resizeHeight}
              onChange={handleResizeHeightChange}
              placeholder="Height"
              className={styles.inputField}
            />
            <label>
              <input
                type="checkbox"
                checked={preserveAspectRatio}
                onChange={handleAspectRatioChange}
              />
              Constrain proportions
            </label>
            {/* <button className={styles.toolButton} onClick={handleResize}>Apply Resize</button> */}
          </div>
        );
      case 'rotate':
        return (
          <div className={styles.rotateFlipControls}>
            <div>Rotate</div>
            <div className={styles.rotateControls}>
              <button className={styles.toolButton} onClick={handleRotateLeft}>Rotate Left</button>
              <button className={styles.toolButton} onClick={handleRotateRight}>Rotate Right</button>
            </div>

            <div>Flip</div>
            <div className={styles.flipControls}>
              <button className={styles.toolButton} onClick={handleFlipHorizontal}>Flip Horizontal</button>
              <button className={styles.toolButton} onClick={handleFlipVertical}>Flip Vertical</button>
            </div> 
          </div>
        );
      case 'adjust':
        return (
          <AdjustSliders
            brightness={brightness}
            contrast={contrast}
            saturation={saturation}
            exposure={exposure}
            setBrightness={setBrightness}
            setContrast={setContrast}
            setSaturation={setSaturation}
            setExposure={setExposure}
          />
        );
      case 'filters':
        return (
          <div className={styles.filterGrid}>
          <button className={styles.toolButton} onClick={() => applyFilter('none')}>None</button>
          <button className={styles.toolButton} onClick={() => applyFilter('grayscale')}>Black&White</button>
          <button className={styles.toolButton} onClick={() => applyFilter('sepia')}>Sepia</button>
          <button className={styles.toolButton} onClick={() => applyFilter('vintage')}>Vintage</button>
        </div>
        );
      default:
        return (
          <>
            <button className={styles.toolButton}>Option 1</button>
            <button className={styles.toolButton}>Option 2</button>
          </>
        );
    }
  };

  const handleSave = () => {
    if (croppedImage) {
      // Создаем ссылку на скачивание изображения
      const link = document.createElement('a');
      link.href = croppedImage;
      link.download = 'edited_image.jpg'; // Название файла
      link.click();
    } else {
      alert('Нет отредактированного изображения для сохранения.');
    }
  };
  
  return (
    <div className={styles.imageProcessorContainer}>
      <header className={styles.header}>
        <div>Image Editor</div>
      </header>

      <div className={styles.contentWrapper}>
        <div className={styles.leftMenu}>
          <button className={styles.toolButton} onClick={() => handleToolClick('crop')}>Crop</button>
          <button className={styles.toolButton} onClick={() => handleToolClick('resize')}>Resize</button>
          <button className={styles.toolButton} onClick={() => handleToolClick('rotate')}>Rotate and flip</button>
          <button className={styles.toolButton} onClick={() => handleToolClick('adjust')}>Adjust</button>
          <button className={styles.toolButton} onClick={() => handleToolClick('filters')}>Filters</button>
        </div>

        <div className={styles.mainContent}>
          {/* <Canvas imageSrc={imageSrc} /> */}

          {activeTool === 'crop' && (
            <ImageCropper
              imageToCrop={imageSrc}
              cropScale={cropScale}
              onImageCropped={(croppedImage) => setCroppedImage(croppedImage)}
            />
          )}
          {activeTool === 'resize' && (
            <div><img src={imageSrc} className={preserveAspectRatio ? styles.saveConstrainResizeImage : ""} height={resizeHeight} width={resizeWidth} alt="Uploaded"/></div>
          )}
          {activeTool === 'rotate' && (
            <div>
              <img
                src={imageSrc}
                alt="Rotated"
                style={{
                  transform: `
                    rotate(${rotateAngle}deg) 
                    scaleX(${flipHorizontal ? -1 : 1}) 
                    scaleY(${flipVertical ? -1 : 1})
                  `,
                }}
                className={styles.rotatedImage}
              />
            </div>
          )}
          {activeTool === 'adjust'&& (
            <AdjustTool
              imageSrc={imageSrc}
              brightness={brightness}
              contrast={contrast}
              saturation={saturation}
              exposure={exposure}
            />
          )}
          {activeTool === 'filters' && (
            <FilterTool imageSrc={imageSrc} selectedFilter={activeFilter} />
          )}
          {activeTool === null && <div><img src={imageSrc} alt="Uploaded"/></div>}

          <footer className={styles.footer}>
            <div className={styles.editTools}>
              <button className={styles.toolButton} onClick={onCancel}>Cancel</button>
              <button className={styles.toolButton}>Save</button>
            </div>
          </footer>
        </div>

        {/* <img src={imageSrc} alt="Editable" className={styles.editableImage} /> */}
        <div className={styles.rightMenu}>
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
};

export default ImageProcessor;