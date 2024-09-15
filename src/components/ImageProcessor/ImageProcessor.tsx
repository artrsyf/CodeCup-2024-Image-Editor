import React, { FC, useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Line, Circle, Rect, Transformer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { Select, Option, Input, Checkbox } from '@material-tailwind/react';

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

const MAX_HISTORY = 20;

interface ImageProcessorProps {
  imageSrc: string;
  onCancel: () => void;
}

const ImageProcessor: FC<ImageProcessorProps> = ({ imageSrc, onCancel }) => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | undefined>(undefined);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | undefined>(undefined);
  const [tempImage, setTempImage] = useState<HTMLImageElement | undefined>(undefined);

  const [undoStack, setUndoStack] = useState<HTMLImageElement[]>([]);
  const [redoStack, setRedoStack] = useState<HTMLImageElement[]>([]);

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
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [elements, setElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<any>(null);

  const [editingText, setEditingText] = useState<any>(null);

  const canvasContainerRef = useRef<HTMLDivElement>(null); // Ref для контейнера канваса

  const [canvasHeight, setCanvasHeight] = useState<number>(0);
  const [canvasWidth, setCanvasWidth] = useState<number>(0);

  const [activeChanges, setActiveChanges] = useState<boolean>(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((modalRef.current && !modalRef.current.contains(event.target as Node)) && 
      (true)) {
        setShowElementsModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        const { offsetWidth, offsetHeight } = canvasContainerRef.current;
        setCanvasHeight(offsetHeight);
        setCanvasWidth(offsetWidth);
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
      setOriginalImage(img)
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
    setActiveChanges(true)
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
    setActiveChanges(true)
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
    setActiveChanges(true)
  };

  const fitDimensions = (width: number, height: number, canvasWidth: number, canvasHeight: number) => {
    // Вычисляем соотношение сторон изображения и канваса
    const imageRatio = width / height;
    const canvasRatio = canvasWidth / canvasHeight;
  
    let newWidth, newHeight;
  
    // Если соотношение изображения шире, чем канвас, ограничиваем по ширине
    if (imageRatio > canvasRatio) {
      newWidth = canvasWidth;
      newHeight = canvasWidth / imageRatio;
    } else {
      // Если соотношение изображения уже, чем канвас, ограничиваем по высоте
      newHeight = canvasHeight;
      newWidth = canvasHeight * imageRatio;
    }
  
    return { width: newWidth, height: newHeight };
  }

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
              label="Crop ratio"
              onChange={(value: string | undefined) => setCropScale(parseFloat(value ?? "1"))}
              color="blue"
              containerProps={{
                className: "!min-w-0",
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
            {/* @ts-ignore */}
            <Input
              type="number"
              label="Width (px)"
              color="blue"
              value={resizeWidth}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                setResizeWidth(Number(event.target.value))}
              placeholder="Width"
              className={styles.inputField}
              containerProps={{
                className: "!min-w-0",
              }}
            />
            {/* @ts-ignore */}
            <Input
              type="number"
              value={resizeHeight}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setResizeHeight(Number(event.target.value))}
              label="Height (px)"
              color="blue"
              placeholder="Height"
              className={styles.inputField}
              containerProps={{
                className: "!min-w-0",
              }}
            />
              {/* @ts-ignore */}
              <Checkbox
                color="blue"
                checked={preserveAspectRatio}
                label="Constrain proportions"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setPreserveAspectRatio(event.target.checked)}
                containerProps={{
                  className: "!min-w-0",
                }}
              >
              </Checkbox>
          </div>
        );
      case 'rotate':
        return (
          <div className={styles.rotateFlipControls}>
            <div className={styles.rotateControlsContainer}>
              <div className={styles.rotateControlsNaming}>Rotate</div>
              <div className={styles.rotateControls}>
                <button className={styles.flipRotateButton} onClick={() =>
                  setRotateAngle((prevAngle) => (prevAngle - 90 + 360) % 360)
                }>
                  <svg width="30" height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-2.89051e-06 16L-3.68267e-06 29.7143C-3.71769e-06 30.3205 0.24313 30.9019 0.675905 31.3305C1.10868 31.7592 1.69565 32 2.30769 32L16.1538 32C16.7659 32 17.3529 31.7592 17.7856 31.3305C18.2184 30.9019 18.4615 30.3205 18.4615 29.7143L18.4615 16C18.4615 15.3938 18.2184 14.8124 17.7856 14.3838C17.3529 13.9551 16.7659 13.7143 16.1538 13.7143L2.30769 13.7143C1.69565 13.7143 1.10868 13.9551 0.675906 14.3838C0.243131 14.8124 -2.8555e-06 15.3938 -2.89051e-06 16ZM16.1538 29.7143L2.30769 29.7143L2.30769 15.9989L16.1538 16L16.1538 29.7143ZM17.3077 1.4875e-06L18.9346 1.61143L15.9577 4.57143L21.9231 4.57143C24.0643 4.57445 26.1169 5.41828 27.631 6.91792C29.145 8.41755 29.9969 10.4506 30 12.5714L30 18.2857L27.6923 18.2857L27.6923 12.5714C27.6905 11.0565 27.0821 9.60407 26.0005 8.53282C24.919 7.46158 23.4526 6.85896 21.9231 6.85714L15.9577 6.85714L18.9346 9.81714L17.3077 11.4286L11.5385 5.71429L17.3077 1.4875e-06Z" fill="#7B828E"/>
                  </svg>
                </button>
                <button className={styles.flipRotateButton} onClick={() => 
                  setRotateAngle((prevAngle) => (prevAngle + 90) % 360)
                }>
                  <svg width="30" height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 16L30 29.7143C30 30.3205 29.7569 30.9019 29.3241 31.3305C28.8913 31.7592 28.3043 32 27.6923 32L13.8462 32C13.2341 32 12.6471 31.7592 12.2144 31.3305C11.7816 30.9019 11.5385 30.3205 11.5385 29.7143L11.5385 16C11.5385 15.3938 11.7816 14.8124 12.2144 14.3838C12.6471 13.9551 13.2341 13.7143 13.8462 13.7143L27.6923 13.7143C28.3043 13.7143 28.8913 13.9551 29.3241 14.3838C29.7569 14.8124 30 15.3938 30 16ZM13.8462 29.7143L27.6923 29.7143L27.6923 15.9989L13.8462 16L13.8462 29.7143ZM12.6923 1.4875e-06L11.0654 1.61143L14.0423 4.57143L8.07692 4.57143C5.93573 4.57445 3.8831 5.41828 2.36905 6.91792C0.854991 8.41755 0.00305107 10.4506 -1.12222e-06 12.5714L-7.92157e-07 18.2857L2.30769 18.2857L2.30769 12.5714C2.30952 11.0565 2.91794 9.60407 3.99948 8.53282C5.08103 7.46158 6.54739 6.85896 8.07692 6.85714L14.0423 6.85714L11.0654 9.81714L12.6923 11.4286L18.4615 5.71429L12.6923 1.4875e-06Z" fill="#7B828E"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.flipControlsContainer}>
              <div className={styles.flipControlsNaming}>Flip</div>
              <div className={styles.flipControls}>
                <button className={styles.flipRotateButton} onClick={() => 
                  setFlipVertical((prev) => !prev)
                }>
                  <svg width="36" height="22" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="4.37114e-08" x2="18" y2="22" stroke="#7B828E" stroke-width="2"/>
                    <rect width="11" height="22" fill="#7B828E"/>
                    <rect x="26" y="1" width="9" height="20" stroke="#7B828E" stroke-width="2"/>
                  </svg>
                </button>
                <button className={styles.flipRotateButton} onClick={() =>
                  setFlipHorizontal((prev) => !prev)
                }>
                  <svg width="22" height="36" viewBox="0 0 22 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="22" y1="18" x2="-8.74228e-08" y2="18" stroke="#7B828E" stroke-width="2"/>
                    <rect x="22" width="11" height="22" transform="rotate(90 22 0)" fill="#7B828E"/>
                    <rect x="21" y="26" width="9" height="20" transform="rotate(90 21 26)" stroke="#7B828E" stroke-width="2"/>
                  </svg>
                </button>
              </div> 
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
            <div className={styles.filterWrapper}>
              <button 
                className={`${styles.filterButton} ${activeFilter === "none" ? styles.filterButtonActive : ""}`} 
                onClick={() => setActiveFilter("none")}
              >
                <div className='filterPreview'>
                  <FilterTool 
                    imageSrc={currentImage?.src || ""}
                    width={74}
                    height={74}
                    selectedFilter="none"
                    isPreview={true}
                    onImageFiltered={() => null}
                  />
                </div>
              </button>
              <div className={styles.filterText}>None</div>
            </div>
            <div className={styles.filterWrapper}>
              <button 
                className={`${styles.filterButton} ${activeFilter === "grayscale" ? styles.filterButtonActive : ""}`}
                onClick={() => setActiveFilter("grayscale")}
              >
                <div className='filterPreview'>
                  <FilterTool 
                    imageSrc={currentImage?.src || ""}
                    width={74}
                    height={74} 
                    selectedFilter="grayscale"
                    isPreview={true}
                    onImageFiltered={() => null}
                  />
                </div>
              </button>
              <div className={styles.filterText}>Black&White</div>
            </div>
            
            <div className={styles.filterWrapper}>
              <button 
                className={`${styles.filterButton} ${activeFilter === "sepia" ? styles.filterButtonActive : ""}`}
                onClick={() => setActiveFilter("sepia")}
              >
                <div className='filterPreview'>
                  <FilterTool 
                    imageSrc={currentImage?.src || ""}
                    width={74}
                    height={74}
                    selectedFilter="sepia"
                    isPreview={true}
                    onImageFiltered={() => null}
                  />
                </div>
              </button>
              <div className={styles.filterText}>Sepia</div>
            </div>
          
            <div className={styles.filterWrapper}>
              <button 
                className={`${styles.filterButton} ${activeFilter === "vintage" ? styles.filterButtonActive : ""}`}
                onClick={() => setActiveFilter("vintage")}
              >
                <div className='filterPreview'>
                  <FilterTool 
                    imageSrc={currentImage?.src || ""} 
                    width={74}
                    height={74}
                    selectedFilter="vintage"
                    isPreview={true}
                    onImageFiltered={() => null}
                  />
                </div>
              </button>
              <div className={styles.filterText}>Vintage</div>
            </div>
        </div>
        );
      case 'elements':
        if (selectedElement) {
          if (selectedElement.type === 'text') {
            return (
              <TextSettingsMenu
                textNode={stageRef.current?.findOne(`#${selectedElement.id}`)}
              />
            );
          } else {
              return (
                <ShapeSettingsMenu
                    shapeNode={stageRef.current?.findOne(`#${selectedElement.id}`)}
                />
              );
          }
        }
        return <div></div>;
      default:
        return null;
    }
  };

  const clearChanges = () => {
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

    if (activeFilter) setActiveFilter(null);

    setElements([]);
    if (selectedElement) setSelectedElement(null);

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
      // Добавляем текущее изображение в undoStack, только если оно существует
      setUndoStack(prevStack => {
        if (currentImage) {
          const newStack = [...prevStack, currentImage]; // Добавляем только если currentImage не undefined
          // Ограничиваем стек до 20 шагов
          if (newStack.length > MAX_HISTORY) {
            newStack.shift(); // Удаляем самое старое состояние, если больше 20
          }
          return newStack;
        }
        return prevStack; // Если currentImage отсутствует, возвращаем стек как есть
      });
  
      // Обновляем текущее изображение и очищаем временные изменения
      setCurrentImage(tempImage);
      setRedoStack([]); // Очистка redoStack при сохранении нового изображения
      clearChanges();
    }
  };

  const undo = () => {
    setUndoStack(prevUndoStack => {
      if (prevUndoStack.length === 0) return prevUndoStack; // Нельзя сделать undo, если стека нет
  
      // Берем последнее состояние из undoStack
      const lastImage = prevUndoStack[prevUndoStack.length - 1];
  
      // Убираем последнее состояние из undoStack
      const newUndoStack = prevUndoStack.slice(0, -1);
  
      // Сохраняем текущее изображение в redoStack, только если оно существует
      setRedoStack(prevRedoStack => {
        if (currentImage) {
          return [...prevRedoStack, currentImage];
        }
        return prevRedoStack;
      });
  
      // Устанавливаем последнее изображение как текущее
      setCurrentImage(lastImage);
      
      return newUndoStack;
    });
  };

  const redo = () => {
    setRedoStack(prevRedoStack => {
      if (prevRedoStack.length === 0) return prevRedoStack; // Нельзя сделать redo, если стека нет
  
      // Берем последнее состояние из redoStack
      const lastImage = prevRedoStack[prevRedoStack.length - 1];
  
      // Убираем последнее состояние из redoStack
      const newRedoStack = prevRedoStack.slice(0, -1);
  
      // Сохраняем текущее изображение в undoStack, только если оно существует
      setUndoStack(prevUndoStack => {
        if (currentImage) {
          return [...prevUndoStack, currentImage];
        }
        return prevUndoStack;
      });
  
      // Устанавливаем последнее изображение как текущее
      setCurrentImage(lastImage);
  
      return newRedoStack;
    });
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
            if (activeTool != "elements") {
              confirmExit();
              setActiveTool("elements")
            }
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
            <div ref={modalRef} className={styles.elementsModal} style={{ position: 'absolute', left: '240px', top: '210px' }}>
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
                  <line y1="19" x2="40" y2="19" stroke="#12A3F8" stroke-width="2"/>
                </svg>
                <div className={styles.figureButtonText}>Line</div>
              </div>
              <div className={styles.figureButton} onClick={() => addElement('circle')}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="#12A3F8"/>
                </svg>
                <div className={styles.figureButtonText}>Circle</div>
              </div>
              <div className={styles.figureButton} onClick={() => addElement('rect')}>
                <svg width="40" height="40" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" fill="#12A3F8"/>
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
              width={fitDimensions(resizeWidth, resizeHeight, canvasWidth, canvasHeight).width}
              height={fitDimensions(resizeWidth, resizeHeight, canvasWidth, canvasHeight).height}
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
              width={fitDimensions(resizeWidth, resizeHeight, canvasWidth, canvasHeight).width}
              height={fitDimensions(resizeWidth, resizeHeight, canvasWidth, canvasHeight).height}
              selectedFilter={activeFilter}
              isPreview={false}
              onImageFiltered={(tempImage) => {setTempImage(tempImage); setActiveChanges(true)}}
            />
          )}
          {activeTool === 'elements' && (
            <div className={styles.canvasContainer} id='canvasContainer' ref={canvasContainerRef}>
            <Stage 
              width={fitDimensions(resizeWidth, resizeHeight, canvasWidth, canvasHeight).width}
              height={fitDimensions(resizeWidth, resizeHeight, canvasWidth, canvasHeight).height}
              ref={stageRef} 
              onMouseDown={(e) => e.target === e.target.getStage() && setSelectedElement(null)} 
              perfectDrawEnabled={true} pixelRatio={window.devicePixelRatio}
            >
              <Layer>
                {imageSrc && (
                  <KonvaImage
                    image={currentImage}
                    x={0}
                    y={0}
                    width={fitDimensions(resizeWidth, resizeHeight, canvasWidth, canvasHeight).width}
                    height={fitDimensions(resizeWidth, resizeHeight, canvasWidth, canvasHeight).height}
                    listening={false}
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
                          strokeWidth={5}
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
                <div onClick={() => setCurrentImage(originalImage)} className={styles.revertButton}>Revert original</div>
              </div>
              <div className={styles.buttonCategory}>
                <button className={styles.redoUndoButton} onClick={undo} disabled={undoStack.length === 0}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.6248 3.09364C13.5903 2.80347 15.5899 3.19227 17.3203 4.19602C19.0497 5.19922 20.4125 6.75943 21.2123 8.63361C22.0119 10.5073 22.2087 12.5997 21.7753 14.598C21.3419 16.5966 20.2995 18.4015 18.7959 19.7365C17.2915 21.0723 15.4071 21.8644 13.4252 21.9841C11.4431 22.1038 9.48203 21.5437 7.83826 20.3956C6.19543 19.2482 4.96089 17.5779 4.31117 15.6428C4.13538 15.1193 4.4173 14.5523 4.94086 14.3765C5.46442 14.2007 6.03136 14.4827 6.20715 15.0062C6.72462 16.5474 7.70234 17.8612 8.98348 18.756C10.2637 19.6502 11.78 20.0799 13.3046 19.9878C14.8294 19.8957 16.2911 19.286 17.468 18.241C18.6458 17.1952 19.4748 15.7694 19.8208 14.1741C20.1668 12.5786 20.0088 10.9088 19.3728 9.41863C18.7371 7.92897 17.6614 6.706 16.3168 5.92604C14.9731 5.14662 13.4296 4.84887 11.9169 5.0722C10.4037 5.29559 8.99272 6.02998 7.89962 7.17503C7.89266 7.18233 7.88558 7.18952 7.8784 7.1966L5.43849 9.60235H8.40038C8.95267 9.60235 9.40038 10.0501 9.40038 10.6024C9.40038 11.1546 8.95267 11.6024 8.40038 11.6024H3C2.44772 11.6024 2 11.1546 2 10.6024V4.93569C2 4.38341 2.44772 3.93569 3 3.93569C3.55228 3.93569 4 4.38341 4 4.93569V8.212L6.46372 5.78278C7.85502 4.33021 9.66475 3.383 11.6248 3.09364Z" fill="#7B828E"/>
                  </svg>
                </button>
                <div className={styles.applyButton} onClick={saveCurrentImage}>Apply</div>
                <button className={styles.redoUndoButton} onClick={redo} disabled={redoStack.length === 0}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.3752 3.09364C10.4097 2.80347 8.41011 3.19227 6.67971 4.19602C4.95026 5.19922 3.58748 6.75943 2.78767 8.63361C1.98806 10.5073 1.79129 12.5997 2.22466 14.598C2.65809 16.5966 3.70045 18.4015 5.20407 19.7365C6.7085 21.0723 8.59294 21.8644 10.5748 21.9841C12.5569 22.1038 14.518 21.5437 16.1617 20.3956C17.8046 19.2482 19.0391 17.5779 19.6888 15.6428C19.8646 15.1193 19.5827 14.5523 19.0591 14.3765C18.5356 14.2007 17.9686 14.4827 17.7928 15.0062C17.2754 16.5474 16.2977 17.8612 15.0165 18.756C13.7363 19.6502 12.22 20.0799 10.6954 19.9878C9.1706 19.8957 7.70891 19.286 6.53196 18.241C5.3542 17.1952 4.52519 15.7694 4.17922 14.1741C3.8332 12.5786 3.99123 10.9088 4.62716 9.41863C5.26289 7.92897 6.33862 6.706 7.68323 5.92604C9.02689 5.14662 10.5704 4.84887 12.0831 5.0722C13.5963 5.29559 15.0073 6.02998 16.1004 7.17503C16.1073 7.18233 16.1144 7.18952 16.1216 7.1966L18.5615 9.60235H15.5996C15.0473 9.60235 14.5996 10.0501 14.5996 10.6024C14.5996 11.1546 15.0473 11.6024 15.5996 11.6024H21C21.5523 11.6024 22 11.1546 22 10.6024V4.93569C22 4.38341 21.5523 3.93569 21 3.93569C20.4477 3.93569 20 4.38341 20 4.93569V8.212L17.5363 5.78278C16.145 4.33021 14.3352 3.383 12.3752 3.09364Z" fill="#7B828E"/>
                  </svg>
                </button>
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