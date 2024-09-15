import { FC } from 'react';
import styles from './assets/ImageProcessor.module.css';
import { Slider } from "@material-tailwind/react";

interface AdjustSlidersProps {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  setBrightness: (value: number) => void;
  setContrast: (value: number) => void;
  setSaturation: (value: number) => void;
  setExposure: (value: number) => void;
}

const AdjustSliders: FC<AdjustSlidersProps> = ({
  brightness,
  contrast,
  saturation,
  exposure,
  setBrightness,
  setContrast,
  setSaturation,
  setExposure,
}) => {
  const scaleValue = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  return (
    <div className={styles.sliderContainer}>
      <label>
        Brightness:
        {/* @ts-ignore */}
        <Slider
          value={scaleValue(brightness, -1, 1, 0, 100)}
          color='blue'
          onChange={(event) =>
            setBrightness(scaleValue(parseFloat(event.target.value), 0, 100, -1, 1))
          }
        />
      </label>

      <label>
        Contrast:
        {/* @ts-ignore */}
        <Slider
          value={scaleValue(contrast, -100, 100, 0, 100)}
          color='blue'
          onChange={(event) =>
            setContrast(scaleValue(parseFloat(event.target.value), 0, 100, -100, 100))
          }
        />
      </label>

      <label>
        Saturation:
        {/* @ts-ignore */}
        <Slider
          value={scaleValue(saturation, -1, 1, 0, 100)}
          color='blue'
          onChange={(event) =>
            setSaturation(scaleValue(parseFloat(event.target.value), 0, 100, -1, 1))
          }
        />
      </label>

      <label>
        Exposure:
        {/* @ts-ignore */}
        <Slider
          value={scaleValue(exposure, 0, 2, 0, 100)}
          color='blue'
          onChange={(event) =>
            setExposure(scaleValue(parseFloat(event.target.value), 0, 100, 0, 2))
          }
        />
      </label>
    </div>
  );
};

export default AdjustSliders;