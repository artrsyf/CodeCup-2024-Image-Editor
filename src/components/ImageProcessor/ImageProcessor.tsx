import React, { FC, useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Line, Circle, Rect, Transformer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';

import ImageCropper from "./ImageCropper";
import AdjustTool from "./AdjustTool"
import AdjustSliders from "./AdjustSliders";
import styles from './assets/ImageProcessor.module.css';
import TextSettingsMenu from './TextSettingsMenu';
import ShapeSettingsMenu from "./ShapeSettingsMenu"
import FilterTool from "./FilterTool"

import {renderTextEditArea, produceResizedTempImage, produceRotatedTempImage} from "./utils/utils"

interface ImageProcessorProps {
  imageSrc: string;
  onCancel: () => void;
}

const ImageProcessor: FC<ImageProcessorProps> = ({ imageSrc, onCancel }) => {
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | undefined>(undefined);
  const [tempImage, setTempImage] = useState<HTMLImageElement | undefined>(undefined);

  const [activeTool, setActiveTool] = useState<string | null>(null);

  //cropSettings
  const [cropScale, setCropScale] = useState<number>(1);

  //adjustSettings
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const [resizeHeight, setResizeHeight] = useState<number>(0);
  const [resizeWidth, setResizeWidth] = useState<number>(0);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(true);

  //rotateSettings
  const [rotateAngle, setRotateAngle] = useState<number>(0); // Для хранения угла поворота
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false); // Для горизонтального отражения
  const [flipVertical, setFlipVertical] = useState<boolean>(false); // Для вертикального отражения

  //slidersSettings
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [exposure, setExposure] = useState<number>(1);

  // filterSettings
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const [showElementsModal, setShowElementsModal] = useState<boolean>(false);
  const [elements, setElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<any>(null);

  const [editingText, setEditingText] = useState<any>(null);

  const canvasContainerRef = useRef<HTMLDivElement>(null); // Ref для контейнера канваса

  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  const [canvasHeight, setCanvasHeight] = useState<number>(0);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        const { offsetWidth, offsetHeight } = canvasContainerRef.current;
        setCanvasWidth(offsetWidth);
        setCanvasHeight(offsetHeight);
      }
    };

    updateCanvasSize();

    // Слушаем изменение размеров окна для обновления размеров канваса
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [resizeWidth, resizeHeight]);


  // Начальная установка текущей пикчи
  useEffect(() => {
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      setCurrentImage(img);
      setTempImage(img);

      setResizeHeight(img.height);
      setResizeWidth(img.width);
    };
  }, [imageSrc]);

  const addElement = (type: string) => {
    let newElement;
    switch (type) {
      case 'text':
        newElement = {
          id: `element-${elements.length + 1}`,
          type: 'text',
          x: 100,
          y: 100,
          text: 'Sample Text',
          fontSize: 24,
          draggable: true,
        };
        break;
      case 'line':
        newElement = {
          id: `element-${elements.length + 1}`,
          type: 'line',
          points: [50, 50, 150, 150],
          stroke: 'black',
          strokeWidth: 2,
          draggable: true,
        };
        break;
      case 'circle':
        newElement = {
          id: `element-${elements.length + 1}`,
          type: 'circle',
          x: 150,
          y: 150,
          radius: 50,
          fill: 'transparent',
          stroke: 'black',
          strokeWidth: 2,
          draggable: true,
        };
        break;
      case 'rect':
        newElement = {
          id: `element-${elements.length + 1}`,
          type: 'rect',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: 'black',
          strokeWidth: 2,
          draggable: true,
        };
        break;
      default:
        return;
    }
    setElements([...elements, newElement]);
    setShowElementsModal(false);

    saveToTempImage();
  };

  useEffect(() => {
    if (transformerRef.current && selectedElement) {
      const selectedNode = stageRef.current?.findOne(`#${selectedElement.id}`);
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedElement]);

  // Обработчик клика на элемент для выделения
  const handleSelectElement = (element: any) => {
    setSelectedElement(element);
  };

  // Обработчик изменения элемента с помощью трансформера
  const handleTransform = (e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const updatedElement = {
      ...selectedElement,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      ...(selectedElement.type === 'rect' || selectedElement.type === 'text'
        ? { width: node.width() * scaleX, height: node.height() * scaleY }
        : {}),
      ...(selectedElement.type === 'circle' ? { radius: node.radius() * scaleX } : {}),
    };

    setElements((prev) =>
      prev.map((el) => (el.id === updatedElement.id ? updatedElement : el))
    );

    node.scaleX(1);
    node.scaleY(1);

    saveToTempImage();
  };

  const saveToTempImage = () => {
    console.log("trying")
    if (stageRef.current) {
      console.log("saving")
      const stage = stageRef.current;
      const dataURL = stage.toDataURL({ pixelRatio: 3 }); // Increase quality

      const newImage = new Image();
      newImage.src = dataURL;

      setTempImage(newImage);
    }
  };

  const handleDragEnd = () => {
    saveToTempImage();
  };

  useEffect(() => {
    if (editingText) {
      renderTextEditArea(editingText, stageRef, setEditingText);
    }
  }, [editingText]);

  const renderRightPanel = () => {
    switch (activeTool) {
      case 'crop':
        return (
          <>
            <label htmlFor="scaleSelect" className={styles.scaleLabel}>
              Crop ratio
            </label>
            <select 
              id="scaleSelect" 
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {setCropScale(parseFloat(event.target.value));}} 
              className={styles.scaleSelect}
              defaultValue="1"
            >
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
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                setResizeWidth(Number(event.target.value))}
              placeholder="Width"
              className={styles.inputField}
            />
            <input
              type="number"
              value={resizeHeight}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setResizeHeight(Number(event.target.value))}
              placeholder="Height"
              className={styles.inputField}
            />
            <label>
              <input
                type="checkbox"
                checked={preserveAspectRatio}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setPreserveAspectRatio(event.target.checked)}
              />
              Constrain proportions
            </label>
          </div>
        );
      case 'rotate':
        return (
          <div className={styles.rotateFlipControls}>
            <div>Rotate</div>
            <div className={styles.rotateControls}>
              <button className={styles.toolButton} onClick={() =>
                setRotateAngle((prevAngle) => (prevAngle - 90 + 360) % 360)
              }>Rotate Left</button>
              <button className={styles.toolButton} onClick={() => 
                setRotateAngle((prevAngle) => (prevAngle + 90) % 360)
              }>Rotate Right</button>
            </div>

            <div>Flip</div>
            <div className={styles.flipControls}>
              <button className={styles.toolButton} onClick={() =>
                setFlipHorizontal((prev) => !prev)
              }>Flip Horizontal</button>
              <button className={styles.toolButton} onClick={() => 
                setFlipVertical((prev) => !prev)
              }>Flip Vertical</button>
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
          <button className={styles.toolButton} onClick={() => setActiveFilter("none")}>None</button>
          <button className={styles.toolButton} onClick={() => setActiveFilter("grayscale")}>Black&White</button>
          <button className={styles.toolButton} onClick={() => setActiveFilter("sepia")}>Sepia</button>
          <button className={styles.toolButton} onClick={() => setActiveFilter("vintage")}>Vintage</button>
        </div>
        );
      case 'elements':
        if (selectedElement) {
          if (selectedElement.type === 'text') {
            return (
              <TextSettingsMenu
                textNode={stageRef.current?.findOne(`#${selectedElement.id}`)}
                onClose={() => setSelectedElement(null)}
              />
            );
          } else {
              return (
                <ShapeSettingsMenu
                    shapeNode={stageRef.current?.findOne(`#${selectedElement.id}`)}
                    onClose={() => setSelectedElement(null)}
                />
              );
          }
        }
        return <div>Select an element to edit.</div>;
      default:
        return null;
    }
  };

  const saveCurrentImage = () => {
    if (tempImage) {
      setCurrentImage(tempImage);
      
      //TODO CLEANER?
      setElements([])
      setFlipHorizontal(false);
      setFlipVertical(false);
      setRotateAngle(0);
    }
  };

  const downloadCurrentImage = () => {
    if (!currentImage) return; // Check if the image exists

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to match the current image size
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    // Draw the image on the canvas
    ctx?.drawImage(currentImage, 0, 0, currentImage.width, currentImage.height);

    // Convert the canvas content to a data URL (base64 format)
    const dataURL = canvas.toDataURL('image/png'); // You can change the format if needed

    // Create an anchor element for downloading the image
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'downloaded_image.png'; // Set the filename for the downloaded image

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up by removing the link element
    link.remove();
  };
  useEffect(() => {
    produceRotatedTempImage(currentImage, canvasRef, rotateAngle, flipHorizontal, flipVertical, setTempImage)
  }, [flipHorizontal, flipVertical, rotateAngle])

  useEffect(() => {
    produceResizedTempImage(currentImage, canvasRef, resizeHeight, resizeHeight, setTempImage)
  }, [resizeHeight, resizeWidth, preserveAspectRatio])
  
  return (
    <div className={styles.imageProcessorContainer}>
      <header className={styles.header}>
        <div>Image Editor</div>
        {/* <img src={tempImage?.src}></img> */}
      </header>

      <div className={styles.contentWrapper}>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className={styles.leftMenu}>
          <button className={styles.toolButton} onClick={() => setActiveTool('crop')}>Crop</button>
          <button className={styles.toolButton} onClick={() => setActiveTool('resize')}>Resize</button>
          <button className={styles.toolButton} onClick={() => setActiveTool('rotate')}>Rotate and flip</button>
          <button className={styles.toolButton} onClick={() => setActiveTool('adjust')}>Adjust</button>
          <button className={styles.toolButton} onClick={() => setActiveTool('filters')}>Filters</button>
          <button className={styles.toolButton} onClick={() => {
            setActiveTool("elements")
            setShowElementsModal((prev) => !prev);
          }}>
            Elements
          </button>
          {showElementsModal && (
            <div className={styles.elementsModal} style={{ position: 'absolute', left: '200px', top: '100px' }}>
              <button className={styles.toolButton} onClick={() => addElement('text')}>Text</button>
              <button className={styles.toolButton} onClick={() => addElement('line')}>Line</button>
              <button className={styles.toolButton} onClick={() => addElement('circle')}>Circle</button>
              <button className={styles.toolButton} onClick={() => addElement('rect')}>Square</button>
            </div>
          )}
        </div>

        <div className={styles.mainContent}>
          {activeTool === 'crop' && (
            <>
            <ImageCropper
              imageToCrop={currentImage?.src || ''}
              cropScale={cropScale}
              onImageCropped={(croppedImage) => setTempImage(croppedImage)}
            />
            </>
          )}
          {/* Resize tool */}
          {activeTool === 'resize' && (
            <div className={styles.canvasContainer} ref={canvasContainerRef}>
              <img
                src={currentImage?.src || ""}
                className={`${preserveAspectRatio ? styles.saveConstrainResizeImage : ""}`}
                height={canvasHeight}
                width={canvasWidth}
                alt="Resized"
              />
            </div>
          )}

          {/* Rotate tool */}
          {activeTool === 'rotate' && (
            <div className={styles.canvasContainer} ref={canvasContainerRef}>
              <img
                src={currentImage?.src || ""}
                className={styles.uploadedImage}
                alt="Rotated"
                style={{
                  transform: `
                    rotate(${rotateAngle}deg)
                    scaleY(${flipHorizontal ? -1 : 1})
                    scaleX(${flipVertical ? -1 : 1})
                  `,
                }}
              />
            </div>
          )}
          {activeTool === 'adjust'&& (
            <AdjustTool
              imageSrc={currentImage?.src || ""}
              brightness={brightness}
              contrast={contrast}
              saturation={saturation}
              exposure={exposure}
              onImageAdjusted={(tempImage) => setTempImage(tempImage)}
            />
          )}
          {activeTool === 'filters' && (
            <FilterTool 
              imageSrc={currentImage?.src || ""} 
              selectedFilter={activeFilter}
              onImageFiltered={(tempImage) => setTempImage(tempImage)}
            />
          )}
          {activeTool === 'elements' && (
            <Stage width={canvasWidth} height={canvasHeight} ref={stageRef} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedElement(null)} perfectDrawEnabled={true} pixelRatio={window.devicePixelRatio}>
              <Layer>
                {imageSrc && (
                  <KonvaImage
                    image={currentImage}
                    x={0}
                    y={0}
                    width={canvasWidth}
                    height={canvasHeight}
                    listening={false} // Disable interactions with the image
                  />
                )}
              </Layer>
              
              <Layer>
                {elements.map((element) => {
                  switch (element.type) {
                    case 'text':
                      return (
                        <React.Fragment key={element.id}>
                          <Text
                            {...element}
                            onClick={() => {
                              handleSelectElement(element)
                            }}
                            onTransformEnd={handleTransform}
                            onDragEnd={handleDragEnd}
                            onDblClick={() => setEditingText(element)}
                            onDblTap={() => setEditingText(element)}
                            id={element.id}
                          />
                        </React.Fragment>
                      );
                    case 'line':
                      return (
                        <Line
                          key={element.id}
                          {...element}
                          onClick={() => handleSelectElement(element)}
                          onTransformEnd={handleTransform}
                          onDragEnd={handleDragEnd}
                          id={element.id}
                        />
                      );
                    case 'circle':
                      return (
                        <Circle
                          key={element.id}
                          {...element}
                          onClick={() => handleSelectElement(element)}
                          onTransformEnd={handleTransform}
                          onDragEnd={handleDragEnd}
                          id={element.id}
                        />
                      );
                    case 'rect':
                      return (
                        <Rect
                          key={element.id}
                          {...element}
                          onClick={() => handleSelectElement(element)}
                          onTransformEnd={handleTransform}
                          onDragEnd={handleDragEnd}
                          id={element.id}
                        />
                      );
                    default:
                      return null;
                  }
                })}
      
                {selectedElement && (
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 20 || newBox.height < 20) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                )}
              </Layer>
            </Stage>
          )}
          {activeTool === null && (
            <div className={styles.canvasContainer} ref={canvasContainerRef}>
              <img className={styles.uploadedImage} src={currentImage?.src} alt="Uploaded"/>
            </div>
          )}

          <footer className={styles.footer}>
            <div className={styles.editTools}>
              <button className={styles.toolButton} onClick={onCancel}>Cancel</button>
              <button className={styles.toolButton} onClick={saveCurrentImage}>Apply</button>
              <button className={styles.toolButton} onClick={downloadCurrentImage}>Save</button>
              <button className={styles.toolButton}>Redo</button>
              <button className={styles.toolButton}>Undo</button>
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