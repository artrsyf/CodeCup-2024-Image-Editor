import React, { useState, useEffect } from 'react';
import Konva from 'konva';

interface TextSettingsMenuProps {
    textNode: Konva.Text;
    onClose: () => void;
}

interface TextSettings {
    fontSize: number;
    fontFamily: string;
    fontStyle: string;
    textAlign: string;
    color: string;
}

const TextSettingsMenu: React.FC<TextSettingsMenuProps> = ({ textNode, onClose }) => {
    const [fontSize, setFontSize] = useState<number>(textNode.fontSize());
    const [fontFamily, setFontFamily] = useState<string>(textNode.fontFamily());
    const [fontStyle, setFontStyle] = useState<string>(textNode.fontStyle());
    const [textAlign, setTextAlign] = useState<string>(textNode.align());
    const [color, setColor] = useState<string>(textNode.fill() as string);

    // Обновляем текстовый узел при изменении значений
    useEffect(() => {
        textNode.fontSize(fontSize);
        textNode.fontFamily(fontFamily);
        textNode.fontStyle(fontStyle);
        textNode.align(textAlign);
        textNode.fill(color);
        textNode.getLayer()?.batchDraw(); // Применяем изменения
    }, [fontSize, fontFamily, fontStyle, textAlign, color, textNode]);

    return (
        <div>
            <h3>Text Settings</h3>
            <div>
                <label>Font Size:</label>
                <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                />
            </div>
            <div>
                <label>Font Family:</label>
                <input
                    type="text"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                />
            </div>
            <div>
                <label>Font Style:</label>
                <select
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value)}
                >
                    <option value="">Normal</option>
                    <option value="italic">Italic</option>
                    <option value="bold">Bold</option>
                </select>
            </div>
            <div>
                <label>Text Align:</label>
                <select
                    value={textAlign}
                    onChange={(e) => setTextAlign(e.target.value)}
                >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </div>
            <div>
                <label>Color:</label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
            </div>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default TextSettingsMenu;
