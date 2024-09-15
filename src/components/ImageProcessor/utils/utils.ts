import Konva from 'konva';

export const renderTextEditArea = (editingText: any, stageRef: React.MutableRefObject<any>, setEditingText: React.Dispatch<any>) => {
    if (!editingText) return null;

    var stage = stageRef.current;
    var textNode = stageRef.current?.findOne(`#${editingText.id}`);
    if (!textNode) return null;

    var tr = new Konva.Transformer({
      node: textNode,
      enabledAnchors: ['middle-left', 'middle-right'],

      boundBoxFunc: function (newBox) {
        newBox.width = Math.max(30, newBox.width);
        return newBox;
      },
    });

    textNode.on('transform', function () {

      textNode.setAttrs({
        width: textNode.width() * textNode.scaleX(),
        scaleX: 1,
      });
    });

    textNode.hide();
    tr.hide();

    var textPosition = textNode.absolutePosition();
    console.log(textPosition)


    var areaPosition = {
      x: stage.container().offsetLeft + textPosition.x,
      y: stage.container().offsetTop + textPosition.y,
    };

    var textarea = document.createElement('textarea');
    const canvasContainer = document.getElementById("canvasContainer")
    canvasContainer?.appendChild(textarea)

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

    textarea.style.height = 'auto';

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

        newWidth = textNode.placeholder.length * textNode.fontSize();
      }
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
      if (e.keyCode === 13 && !e.shiftKey) {
        textNode.text(textarea.value);
        removeTextarea();
        setEditingText(null);
      }
      if (e.keyCode === 27) {
        removeTextarea();
        setEditingText(null);
      }
    });

    textarea.addEventListener('keydown', function () {
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

  export const produceResizedTempImage = (
    currentImage: HTMLImageElement | undefined,
    canvasRef: React.MutableRefObject<HTMLCanvasElement>,
    resizeWidth: number,
    resizeHeight: number,
    setTempImage: (value: React.SetStateAction<HTMLImageElement | undefined>) => void
  ) => {
    if (currentImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = resizeWidth;
        canvas.height = resizeHeight;
        ctx.drawImage(currentImage, 0, 0, resizeWidth, resizeHeight);

        const newImageSrc = canvas.toDataURL('image/jpeg');
        const newImage = new Image();
        newImage.src = newImageSrc;

        setTempImage(newImage);
      }
    }
  };

  export const produceRotatedTempImage = (
    currentImage: HTMLImageElement | undefined,
    canvasRef: React.MutableRefObject<HTMLCanvasElement>,
    rotateAngle: number,
    flipHorizontal: boolean,
    flipVertical: boolean,
    setTempImage: (value: React.SetStateAction<HTMLImageElement | undefined>) => void
  ) => {
    if (currentImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const width = currentImage.width;
        const height = currentImage.height;

        canvas.width = width;
        canvas.height = height;

        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate((rotateAngle * Math.PI) / 180);
        ctx.scale(flipVertical ? -1 : 1, flipHorizontal ? -1 : 1);
        ctx.drawImage(currentImage, -width / 2, -height / 2);
        ctx.restore();
        console.log(ctx)

        const newImageSrc = canvas.toDataURL('image/jpeg');
        const newImage = new Image();
        newImage.src = newImageSrc;

        setTempImage(newImage);
      }
    }
  };