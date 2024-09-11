import React, { FC } from 'react';
import styles from './assets/ImageProcessor.module.css';

const LeftMenu: FC = () => {
  return (
    <div className={styles.leftMenu}>
      <button className={styles.toolButton}>Tool 1</button>
      <button className={styles.toolButton}>Tool 2</button>
      {/* Useless for now */}
    </div>
  );
};

export default LeftMenu;