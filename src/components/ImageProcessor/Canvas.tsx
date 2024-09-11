import React, { FC } from 'react';
import styles from './assets/ImageProcessor.module.css';

interface CanvasProps {
  imageSrc: string;
}

const Canvas: FC<CanvasProps> = ({ imageSrc }) => {
  return (
    <div className={styles.canvas}>
      <img src={imageSrc} alt="Editable" className={styles.editableImage} />
      {/* Pending */}
    </div>
  );
};

export default Canvas;