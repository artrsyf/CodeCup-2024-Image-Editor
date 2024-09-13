import React, { useState } from 'react';
import Konva from 'konva';

interface ShapeSettingsMenuProps {
    shapeNode: Konva.Shape;
    onClose: () => void;
}

const ShapeSettingsMenu: React.FC<ShapeSettingsMenuProps> = ({ shapeNode, onClose }) => {
    const [color, setColor] = useState<string>(shapeNode.fill() as string);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setColor(newColor);
        shapeNode.fill(newColor);
        shapeNode.getLayer()?.batchDraw();
    };

    return (
        <div>
            <h3>Shape Settings</h3>
            <div>
                <label>Color:</label>
                <input
                    type="color"
                    value={color}
                    onChange={handleColorChange}
                />
            </div>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default ShapeSettingsMenu;
