import React, { FC } from 'react';
import styles from './assets/ImageProcessor.module.css';

const RightMenu: FC = () => {
  return (
    <div className={styles.rightMenu}>
      <button className={styles.toolButton}>Option 1</button>
      <button className={styles.toolButton}>Option 2</button>
      {/* Useless for now */}
    </div>
  );
};

export default RightMenu;