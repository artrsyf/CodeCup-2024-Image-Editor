import React, { FC, useState, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Stage, Layer, Text, Line, Circle, Rect, Transformer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';

import ImageCropper from "./ImageCropper";
import AdjustTool from "./AdjustTool"
import AdjustSliders from "./AdjustSliders";
import styles from './assets/ImageProcessor.module.css';
import TextSettingsMenu from './TextSettingsMenu';
import ShapeSettingsMenu from "./ShapeSettingsMenu"
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

  const [showElementsModal, setShowElementsModal] = useState<boolean>(false);
  const [elements, setElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<any>(null);
  const [imgKanva, setImage] = useState<HTMLImageElement | undefined>(undefined);

  const [editingText, setEditingText] = useState<any>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      setImage(img);
    };
  }, [imageSrc]);

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

  const toggleElementsModal = () => {
    setShowElementsModal((prev) => !prev);
  };

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
  };

  useEffect(() => {
    if (editingText) {
      renderTextEditArea();
    }
  }, [editingText]);

  const handleTextDblClick = (element: any) => {
    setEditingText(element);
  };

  const renderTextEditArea = () => {
    if (!editingText) return null;

    var stage = stageRef.current;
    var textNode = stageRef.current?.findOne(`#${editingText.id}`);
    if (!textNode) return null;

    var tr = new Konva.Transformer({
      node: textNode,
      enabledAnchors: ['middle-left', 'middle-right'],
      // set minimum width of text
      boundBoxFunc: function (oldBox, newBox) {
        newBox.width = Math.max(30, newBox.width);
        return newBox;
      },
    });

    textNode.on('transform', function () {
      // reset scale, so only with is changing by transformer
      textNode.setAttrs({
        width: textNode.width() * textNode.scaleX(),
        scaleX: 1,
      });
    });

    textNode.hide();
    tr.hide();

    var textPosition = textNode.absolutePosition();

    // so position of textarea will be the sum of positions above:
    var areaPosition = {
      x: stage.container().offsetLeft + textPosition.x,
      y: stage.container().offsetTop + textPosition.y,
    };

    var textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
    textarea.style.height =
      textNode.height() - textNode.padding() * 2 + 5 + 'px';
    textarea.style.fontSize = textNode.fontSize() + 'px';
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = textNode.lineHeight();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill();
    const rotation = textNode.rotation();
    var transform = '';
    if (rotation) {
      transform += 'rotateZ(' + rotation + 'deg)';
    }

    var px = 0;
    // also we need to slightly move textarea on firefox
    // because it jumps a bit
    var isFirefox =
      navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
      px += 2 + Math.round(textNode.fontSize() / 20);
    }
    transform += 'translateY(-' + px + 'px)';

    textarea.style.transform = transform;

    const updateSizes = () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';

      textNode.width(textarea.offsetWidth);
      textNode.height(textarea.offsetHeight);
      textNode.getLayer()?.batchDraw(); // Ensure the layer is updated
    };

    textarea.addEventListener('input', updateSizes);

    // reset height
    textarea.style.height = 'auto';
    // after browsers resized it we can set actual value
    textarea.style.height = textarea.scrollHeight + 3 + 'px';

    textarea.focus();

    function removeTextarea() {
      textarea.parentNode?.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      textNode.show();
      tr.show();
      tr.forceUpdate();
    }

    function setTextareaWidth(newWidth: any) {
      if (!newWidth) {
        // set width for placeholder
        newWidth = textNode.placeholder.length * textNode.fontSize();
      }
      // some extra fixes on different browsers
      var isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      var isFirefox =
        navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      if (isSafari || isFirefox) {
        newWidth = Math.ceil(newWidth);
      }
      
      // @ts-ignore
      var isEdge = !!document.documentMode || /Edge/.test(navigator.userAgent);
      if (isEdge) {
        newWidth += 1;
      }
      textarea.style.width = newWidth + 'px';
    }

    textarea.addEventListener('keydown', function (e: KeyboardEvent) {
      // hide on enter
      // but don't hide on shift + enter
      if (e.keyCode === 13 && !e.shiftKey) {
        textNode.text(textarea.value);
        removeTextarea();
        setEditingText(null);
      }
      // on esc do not set value back to node
      if (e.keyCode === 27) {
        removeTextarea();
        setEditingText(null);
      }
    });

    textarea.addEventListener('keydown', function (e) {
      const scale = textNode.getAbsoluteScale().x;
      setTextareaWidth(textNode.width() * scale);
      textarea.style.height = 'auto';
      textarea.style.height =
        textarea.scrollHeight + textNode.fontSize() + 'px';
    });

    function handleOutsideClick(e: MouseEvent) {
      if (e.target !== textarea) {
        textNode.text(textarea.value);
        removeTextarea();
        setEditingText(null);
      }
    }
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  };

  const handleApplySettings = (settings: {
    fontSize: number;
    fontFamily: string;
    fontStyle: string;
    textAlign: string;
    color: string;
}) => {
    const textNode = stageRef.current?.findOne(`#${selectedElement?.id}`);
    if (textNode) {
        textNode.fontSize(settings.fontSize);
        textNode.fontFamily(settings.fontFamily);
        textNode.fontStyle(settings.fontStyle);
        textNode.align(settings.textAlign);
        textNode.fill(settings.color as string);
        textNode.getLayer()?.batchDraw();
    }
};

  const handleCloseMenu = () => {
    setSelectedElement(null);
  };

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
      case 'elements':
        if (selectedElement) {
          console.log(selectedElement.type)
          if (selectedElement.type === 'text') {
            return (
              <TextSettingsMenu
                textNode={stageRef.current?.findOne(`#${selectedElement.id}`)}
                onClose={handleCloseMenu}
              />
            );
          } else {
              return (
                <ShapeSettingsMenu
                    shapeNode={stageRef.current?.findOne(`#${selectedElement.id}`)}
                    onClose={handleCloseMenu}
                />
              );
          }
        }
        return <div>Select an element to edit.</div>;
      default:
        return null;
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
          <button className={styles.toolButton} onClick={() => {
            handleToolClick("elements")
            toggleElementsModal()
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
          {activeTool === 'elements' && (
            <Stage width={800} height={600} ref={stageRef} onMouseDown={(e) => e.target === e.target.getStage() && setSelectedElement(null)}>
              <Layer>
                {imageSrc && (
                  <KonvaImage
                    image={imgKanva}
                    x={0}
                    y={0}
                    width={800}
                    height={600}
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
                            onDblClick={() => handleTextDblClick(element)}
                            onDblTap={() => handleTextDblClick(element)}
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
          {activeTool === null && <div><img src={imageSrc} alt="Uploaded"/></div>}

          <footer className={styles.footer}>
            <div className={styles.editTools}>
              <button className={styles.toolButton} onClick={onCancel}>Cancel</button>
              <button className={styles.toolButton} onClick={handleSave}>Save</button>
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