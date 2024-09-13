import React, { FC } from 'react';
import styles from './assets/ImageProcessor.module.css';

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
  return (
    <div className={styles.sliderContainer}>
      <label>
        Brightness:
        <input
          type="range"
          min={-1}
          max={1}
          step={0.1}
          value={brightness}
          onChange={(e) => setBrightness(parseFloat(e.target.value))}
        />
      </label>

      <label>
        Contrast:
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={contrast}
          onChange={(e) => setContrast(parseFloat(e.target.value))}
        />
      </label>

      <label>
        Saturation:
        <input
          type="range"
          min={-1}
          max={1}
          step={0.1}
          value={saturation}
          onChange={(e) => setSaturation(parseFloat(e.target.value))}
        />
      </label>

      <label>
        Exposure:
        <input
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={exposure}
          onChange={(e) => setExposure(parseFloat(e.target.value))}
        />
      </label>
    </div>
  );
};

export default AdjustSliders;