import React, { FC, useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Line, Circle, Rect, Transformer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { Select, Option } from '@material-tailwind/react';

import ImageCropper from "./ImageCropper";
import AdjustTool from "./AdjustTool"
import AdjustSliders from "./AdjustSliders";
import styles from './assets/ImageProcessor.module.css';
import TextSettingsMenu from './TextSettingsMenu';
import ShapeSettingsMenu from "./ShapeSettingsMenu"
import FilterTool from "./FilterTool"

import ResizeTool from "./ResizeTool"
import RotateTool from "./RotateTool"

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
  const [cropScale, setCropScale] = useState<number>(-1);

  //adjustSettings
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const [resizeHeight, setResizeHeight] = useState<number>(0);
  const [resizeWidth, setResizeWidth] = useState<number>(0);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(false);

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

  const [canvasHeight, setCanvasHeight] = useState<number>(0);

  const [activeChanges, setActiveChanges] = useState<boolean>(false)

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        const { offsetWidth, offsetHeight } = canvasContainerRef.current;
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
      
      setActiveChanges(false);
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
            {/* @ts-ignore */}
            <Select
              className="min-w-full !min-w-full"
              label="Crop ratio"
              onChange={(value: string | undefined) => setCropScale(parseFloat(value ?? "1"))}
              color="blue"
              containerProps={{
                className: "min-w-0",
              }}
            >
              <Option value="1">1:1</Option>
              <Option value="1.778">16:9</Option>
              <Option value="1.333">4:3</Option>
            </Select>
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

  const clearChanges = () => {
    setElements([])
    if (cropScale != -1) setCropScale(-1);

    if (flipHorizontal) setFlipHorizontal(false);
    if (flipVertical) setFlipVertical(false);
    if (rotateAngle != 0) setRotateAngle(0);

    if (currentImage && resizeHeight != currentImage.height) setResizeHeight(currentImage.height);
    if (currentImage && resizeWidth != currentImage.width) setResizeWidth(currentImage.width);
    if (preserveAspectRatio) setPreserveAspectRatio(false);

    if (brightness != 0) setBrightness(0);
    if (contrast != 0) setContrast(0);
    if (saturation != 0) setSaturation(0);
    if (exposure != 0) setExposure(1);

    setActiveTool(null);
    setShowElementsModal(false);
    setActiveChanges(false);
  }

  const confirmExit = () => {
    if (activeChanges) {
      const userConfirmed = window.confirm("You have unsaved changes. Do you want to save them?");
      if (userConfirmed) {
        saveCurrentImage();
      } else {
        clearChanges();
      }
    } else {
      clearChanges();
    }
  };

  const saveCurrentImage = () => {
    if (tempImage) {
      setCurrentImage(tempImage);
      clearChanges();
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
        <div className={styles.cancelButton} onClick={onCancel}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#F2F5F7"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M17.4142 16L21.7072 11.707C22.0982 11.316 22.0982 10.684 21.7072 10.293C21.3162 9.90201 20.6842 9.90201 20.2933 10.293L16.0002 14.586L11.7072 10.293C11.3162 9.90201 10.6842 9.90201 10.2932 10.293C9.90225 10.684 9.90225 11.316 10.2932 11.707L14.5862 16L10.2932 20.293C9.90225 20.684 9.90225 21.316 10.2932 21.707C10.4882 21.902 10.7442 22 11.0002 22C11.2563 22 11.5122 21.902 11.7072 21.707L16.0002 17.414L20.2933 21.707C20.4882 21.902 20.7443 22 21.0002 22C21.2562 22 21.5122 21.902 21.7072 21.707C22.0982 21.316 22.0982 20.684 21.7072 20.293L17.4142 16Z" fill="#202020"/>
          </svg>
        </div>
      </header>

      <div className={styles.contentWrapper}>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className={styles.leftMenu}>
          <div className={styles.toolButton} onClick={() => {confirmExit(); setActiveTool('crop');}}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.09176 2L6 12.5882C6 12.9627 6.14874 13.3217 6.4135 13.5865C6.67825 13.8513 7.03734 14 7.41176 14H18" stroke={activeTool && activeTool == 'crop' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 6.09176L12.5882 6C12.9627 6 13.3217 6.14874 13.5865 6.4135C13.8513 6.67825 14 7.03734 14 7.41176V18" stroke={activeTool && activeTool == 'crop' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div className={activeTool && activeTool == 'crop' ? styles.activeLeftMenuToolText : styles.leftMenuToolText}>Crop</div>
          </div>

          <div className={styles.toolButton} onClick={() => {confirmExit(); setActiveTool('resize');}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2H18V7" stroke={activeTool && activeTool == 'resize' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 18H2V13" stroke={activeTool && activeTool == 'resize' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18 2L12 8" stroke={activeTool && activeTool == 'resize' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 18L8 12" stroke={activeTool && activeTool == 'resize' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div className={activeTool && activeTool == 'resize' ? styles.activeLeftMenuToolText : styles.leftMenuToolText}>Resize</div>
          </div>

          <div className={styles.toolButton} onClick={() => {confirmExit(); setActiveTool('rotate');}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2L17 5L14 8" stroke={activeTool && activeTool == 'rotate' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 10V8.33333C3 7.44928 3.30436 6.60143 3.84614 5.97631C4.38791 5.35119 5.12271 5 5.88889 5H16" stroke={activeTool && activeTool == 'rotate' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 18L3 15L6 12" stroke={activeTool && activeTool == 'rotate' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 10V11.6667C17 12.5507 16.6722 13.3986 16.0888 14.0237C15.5053 14.6488 14.714 15 13.8889 15H3" stroke={activeTool && activeTool == 'rotate' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div className={activeTool && activeTool == 'rotate' ? styles.activeLeftMenuToolText : styles.leftMenuToolText}>Rotate and flip</div>
          </div>

          <div className={styles.toolButton} onClick={() => {confirmExit(); setActiveTool('adjust');}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6L9 6" stroke={activeTool && activeTool == 'adjust' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 6L17 6" stroke={activeTool && activeTool == 'adjust' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 14L10 14" stroke={activeTool && activeTool == 'adjust' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 14L17 14" stroke={activeTool && activeTool == 'adjust' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 4L9 8" stroke={activeTool && activeTool == 'adjust' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 12L13 16" stroke={activeTool && activeTool == 'adjust' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div className={activeTool && activeTool == 'adjust' ? styles.activeLeftMenuToolText : styles.leftMenuToolText}>Adjust</div>
          </div>

          <div className={styles.toolButton} onClick={() => {confirmExit(); setActiveTool('filters');}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="6.99998" r="5" stroke={activeTool && activeTool == 'filters' ? "#12A3F8" : "#7B828E"} stroke-width="2"/>
              <circle cx="7" cy="13" r="5" stroke={activeTool && activeTool == 'filters' ? "#12A3F8" : "#7B828E"} stroke-width="2"/>
              <circle cx="13" cy="13" r="5" stroke={activeTool && activeTool == 'filters' ? "#12A3F8" : "#7B828E"} stroke-width="2"/>
            </svg>
            <div className={activeTool && activeTool == 'filters' ? styles.activeLeftMenuToolText : styles.leftMenuToolText}>Filters</div>
          </div>
          <div className={styles.toolButton} onClick={() => {
            confirmExit();
            setActiveTool("elements")
            setShowElementsModal((prev) => !prev);
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L12.472 6.93691L18 7.73344L14 11.5741L14.944 17L10 14.4369L5.056 17L6 11.5741L2 7.73344L7.528 6.93691L10 2Z" stroke={activeTool && activeTool == 'elements' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div className={activeTool && activeTool == 'elements' ? styles.activeLeftMenuToolText : styles.leftMenuToolText}>Elements</div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 17L15 12L10 7.00002" stroke={activeTool && activeTool == 'elements' ? "#12A3F8" : "#7B828E"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          {showElementsModal && (
            <div className={styles.elementsModal} style={{ position: 'absolute', left: '240px', top: '210px' }}>
              <div className={styles.figureButton} onClick={() => addElement('text')}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M0 1C0 0.447715 0.447715 0 1 0H39C39.5523 0 40 0.447715 40 1V8C40 8.55228 39.5523 9 39 9C38.4477 9 38 8.55228 38 8V2H2V8C2 8.55228 1.55228 9 1 9C0.447715 9 0 8.55228 0 8V1Z" fill="#12A3F8"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 39C12 38.4477 12.4477 38 13 38H27C27.5523 38 28 38.4477 28 39C28 39.5523 27.5523 40 27 40H13C12.4477 40 12 39.5523 12 39Z" fill="#12A3F8"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M20 0C20.5523 0 21 0.447715 21 1V39C21 39.5523 20.5523 40 20 40C19.4477 40 19 39.5523 19 39V1C19 0.447715 19.4477 0 20 0Z" fill="#12A3F8"/>
                </svg>
                <div className={styles.figureButtonText}>Text</div>
              </div>
              <div className={styles.figureButton} onClick={() => addElement('line')}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" fill="white"/>
                  <line y1="19" x2="40" y2="19" stroke="#12A3F8" stroke-width="2"/>
                </svg>
                <div className={styles.figureButtonText}>Line</div>
              </div>
              <div className={styles.figureButton} onClick={() => addElement('circle')}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_137_14805)">
                  <rect width="40" height="40" fill="white"/>
                  <circle cx="20" cy="20" r="20" fill="#12A3F8"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_137_14805">
                  <rect width="40" height="40" fill="white"/>
                  </clipPath>
                  </defs>
                </svg>
                <div className={styles.figureButtonText}>Circle</div>
              </div>
              <div className={styles.figureButton} onClick={() => addElement('rect')}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" fill="white"/>
                  <rect y="7" width="40" height="25" fill="#12A3F8"/>
                </svg>
                <div className={styles.figureButtonText}>Square</div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.mainContent}>
          {activeTool === 'crop' && (
            <>
            <ImageCropper
              imageToCrop={currentImage?.src || ''}
              width={resizeWidth * canvasHeight/resizeHeight}
              height={canvasHeight}
              cropScale={cropScale}
              onImageCropped={(croppedImage) => {setTempImage(croppedImage); setActiveChanges(true)}}
            />
            </>
          )}
          {/* Resize tool */}
          {/* {activeTool === 'resize' && (
            <div className={styles.canvasContainer} id='canvasContainer' ref={canvasContainerRef}>
              <img
                src={currentImage?.src || ""}
                className={`${preserveAspectRatio ? styles.saveConstrainResizeImage : ""}`}
                height={canvasHeight}
                width={resizeWidth * canvasHeight/resizeHeight}
                alt="Resized"
              />
            </div>
          )} */}

          {activeTool === 'resize' && (
            <ResizeTool
              imageSrc={currentImage?.src || ""}
              width={resizeWidth * canvasHeight/resizeHeight}
              height={canvasHeight}
              preserveAspectRatio={preserveAspectRatio}
              onImageResized={(resizedImage) => {
                setTempImage(resizedImage);
                setActiveChanges(true);
              }}
            />
          )}

          {/* Rotate tool
          {activeTool === 'rotate' && (
            <div className={styles.canvasContainer} id='canvasContainer' ref={canvasContainerRef}>
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
          )} */}

          {activeTool === 'rotate' && (
            <RotateTool
              imageSrc={currentImage?.src || ""}
              width={resizeWidth * canvasHeight/resizeHeight}
              height={canvasHeight}
              rotateAngle={rotateAngle}
              flipHorizontal={flipHorizontal}
              flipVertical={flipVertical}
              onImageRotated={(rotatedImage) => {
                setTempImage(rotatedImage);
                setActiveChanges(true);
              }}
            />
          )}

          {activeTool === 'adjust'&& (
            <AdjustTool
              imageSrc={currentImage?.src || ""}
              brightness={brightness}
              contrast={contrast}
              saturation={saturation}
              exposure={exposure}
              onImageAdjusted={(tempImage) => {setTempImage(tempImage); setActiveChanges(true)}}
            />
          )}
          {activeTool === 'filters' && (
            <FilterTool 
              imageSrc={currentImage?.src || ""} 
              selectedFilter={activeFilter}
              onImageFiltered={(tempImage) => {setTempImage(tempImage); setActiveChanges(true)}}
            />
          )}
          {activeTool === 'elements' && (
            <div className={styles.canvasContainer} id='canvasContainer' ref={canvasContainerRef}>
            <Stage width={currentImage && currentImage.width * canvasHeight / currentImage.height} height={canvasHeight} ref={stageRef} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedElement(null)} perfectDrawEnabled={true} pixelRatio={window.devicePixelRatio}>
              <Layer>
                {imageSrc && (
                  <KonvaImage
                    image={currentImage}
                    x={0}
                    y={0}
                    width={currentImage && currentImage.width * canvasHeight / currentImage.height}
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
            </div>
          )}
          {activeTool === null && (
            <div className={styles.canvasContainer} id='canvasContainer' ref={canvasContainerRef}>
              <img className={styles.uploadedImage} src={currentImage?.src} alt="Uploaded"/>
            </div>
          )}

          <footer className={styles.footer}>
            <div className={styles.editTools}>
              <div className={styles.buttonCategory}>
                <div className={styles.revertButton}>Revert original</div>
              </div>
              <div className={styles.buttonCategory}>
                <div className={styles.redoUndoButton}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.6248 3.09364C13.5903 2.80347 15.5899 3.19227 17.3203 4.19602C19.0497 5.19922 20.4125 6.75943 21.2123 8.63361C22.0119 10.5073 22.2087 12.5997 21.7753 14.598C21.3419 16.5966 20.2995 18.4015 18.7959 19.7365C17.2915 21.0723 15.4071 21.8644 13.4252 21.9841C11.4431 22.1038 9.48203 21.5437 7.83826 20.3956C6.19543 19.2482 4.96089 17.5779 4.31117 15.6428C4.13538 15.1193 4.4173 14.5523 4.94086 14.3765C5.46442 14.2007 6.03136 14.4827 6.20715 15.0062C6.72462 16.5474 7.70234 17.8612 8.98348 18.756C10.2637 19.6502 11.78 20.0799 13.3046 19.9878C14.8294 19.8957 16.2911 19.286 17.468 18.241C18.6458 17.1952 19.4748 15.7694 19.8208 14.1741C20.1668 12.5786 20.0088 10.9088 19.3728 9.41863C18.7371 7.92897 17.6614 6.706 16.3168 5.92604C14.9731 5.14662 13.4296 4.84887 11.9169 5.0722C10.4037 5.29559 8.99272 6.02998 7.89962 7.17503C7.89266 7.18233 7.88558 7.18952 7.8784 7.1966L5.43849 9.60235H8.40038C8.95267 9.60235 9.40038 10.0501 9.40038 10.6024C9.40038 11.1546 8.95267 11.6024 8.40038 11.6024H3C2.44772 11.6024 2 11.1546 2 10.6024V4.93569C2 4.38341 2.44772 3.93569 3 3.93569C3.55228 3.93569 4 4.38341 4 4.93569V8.212L6.46372 5.78278C7.85502 4.33021 9.66475 3.383 11.6248 3.09364Z" fill="#7B828E"/>
                  </svg>
                </div>
                <div className={styles.applyButton} onClick={saveCurrentImage}>Apply</div>
                <div className={styles.redoUndoButton}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.3752 3.09364C10.4097 2.80347 8.41011 3.19227 6.67971 4.19602C4.95026 5.19922 3.58748 6.75943 2.78767 8.63361C1.98806 10.5073 1.79129 12.5997 2.22466 14.598C2.65809 16.5966 3.70045 18.4015 5.20407 19.7365C6.7085 21.0723 8.59294 21.8644 10.5748 21.9841C12.5569 22.1038 14.518 21.5437 16.1617 20.3956C17.8046 19.2482 19.0391 17.5779 19.6888 15.6428C19.8646 15.1193 19.5827 14.5523 19.0591 14.3765C18.5356 14.2007 17.9686 14.4827 17.7928 15.0062C17.2754 16.5474 16.2977 17.8612 15.0165 18.756C13.7363 19.6502 12.22 20.0799 10.6954 19.9878C9.1706 19.8957 7.70891 19.286 6.53196 18.241C5.3542 17.1952 4.52519 15.7694 4.17922 14.1741C3.8332 12.5786 3.99123 10.9088 4.62716 9.41863C5.26289 7.92897 6.33862 6.706 7.68323 5.92604C9.02689 5.14662 10.5704 4.84887 12.0831 5.0722C13.5963 5.29559 15.0073 6.02998 16.1004 7.17503C16.1073 7.18233 16.1144 7.18952 16.1216 7.1966L18.5615 9.60235H15.5996C15.0473 9.60235 14.5996 10.0501 14.5996 10.6024C14.5996 11.1546 15.0473 11.6024 15.5996 11.6024H21C21.5523 11.6024 22 11.1546 22 10.6024V4.93569C22 4.38341 21.5523 3.93569 21 3.93569C20.4477 3.93569 20 4.38341 20 4.93569V8.212L17.5363 5.78278C16.145 4.33021 14.3352 3.383 12.3752 3.09364Z" fill="#7B828E"/>
                  </svg>
                </div>
              </div>
              <div className={styles.buttonCategory}>
                <div className={styles.secondaryButton} onClick={onCancel}>Cancel</div>
                <div className={styles.primaryButton} onClick={downloadCurrentImage}>Save</div>
              </div>
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