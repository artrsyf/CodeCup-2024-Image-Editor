import React, { useState } from 'react';
import Konva from 'konva';

import styles from './assets/ImageProcessor.module.css';

interface ShapeSettingsMenuProps {
    shapeNode: Konva.Shape;
}

const ShapeSettingsMenu: React.FC<ShapeSettingsMenuProps> = ({ shapeNode }) => {
    const [color, setColor] = useState<string>(shapeNode.fill() as string);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setColor(newColor);
        shapeNode.fill(newColor);
        shapeNode.stroke(newColor);
        shapeNode.getLayer()?.batchDraw();
    };

    return (
        <div className={styles.figureEditWrapper}>
            <div className={styles.colorWrapper}>
                <label className={styles.colorLabel}>Color</label>
                <div className={styles.colorChoose}>{color}</div>
                <input
                    className={styles.colorInput}
                    type="color"
                    value={color}
                    onChange={handleColorChange}
                />
            </div>
        </div>
    );
};

export default ShapeSettingsMenu;
