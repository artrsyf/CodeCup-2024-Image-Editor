import React, { useState, useEffect } from 'react';
import Konva from 'konva';
import { Select, Option } from '@material-tailwind/react';
import styles from './assets/ImageProcessor.module.css';

interface TextSettingsMenuProps {
    textNode: Konva.Text;
}

interface TextSettings {
    fontSize: number;
    fontFamily: string;
    fontStyle: string;
    textAlign: string;
    color: string;
}

const TextSettingsMenu: React.FC<TextSettingsMenuProps> = ({ textNode }) => {
    const [fontSize, setFontSize] = useState<number>(textNode.fontSize());
    const [fontFamily, setFontFamily] = useState<string>(textNode.fontFamily());
    const [fontStyle, setFontStyle] = useState<string>(textNode.fontStyle());
    const [fontDecoration, setFontDecoration] = useState<string>(textNode.textDecoration());
    const [textAlign, setTextAlign] = useState<string>(textNode.align());
    const [color, setColor] = useState<string>(textNode.fill() as string);

    useEffect(() => {
        textNode.fontSize(fontSize);
        textNode.fontFamily(fontFamily);
        textNode.fontStyle(fontStyle);
        textNode.textDecoration(fontDecoration);
        textNode.align(textAlign);
        textNode.fill(color);
        textNode.getLayer()?.batchDraw();
    }, [fontSize, fontFamily, fontStyle, fontDecoration, textAlign, color, textNode]);

    return (
        <div className={styles.textEditWrapper}>
            <div>
                {/* @ts-ignore */}
                <Select
                    label="Font"
                    onChange={(value: string | undefined) => {if (value) setFontFamily(value)}}
                    color="blue"
                    containerProps={{
                        className: "!min-w-0",
                    }}
                >
                    <Option value="Avenir Next">Avenir Next</Option>
                    <Option value="Arial">Arial</Option>
                    <Option value="Impact">Impact</Option>
                    <Option value="Book Antiqua">Book Antiqua</Option>
                    <Option value="Comic Sans MS">Comic Sans MS</Option>
                </Select>
            </div>
            <div>
                {/* @ts-ignore */}
                <Select
                    label="Size"
                    onChange={(value: string | undefined) => {if (value) setFontSize(parseInt(value, 10))}}
                    color="blue"
                    containerProps={{
                        className: "!min-w-0",
                    }}
                >
                    <Option value="8">8</Option>
                    <Option value="9">9</Option>
                    <Option value="10">10</Option>
                    <Option value="11">11</Option>
                    <Option value="12">12</Option>
                    <Option value="14">14</Option>
                    <Option value="16">16</Option>
                    <Option value="18">18</Option>
                    <Option value="20">20</Option>
                    <Option value="24">24</Option>
                </Select>
            </div>
            <div>
                <label>Style</label>
                <div className={styles.styleWrapper}>
                    <button className={styles.styleButton} onClick={() => {
                        if (fontStyle == "bold") {
                            setFontStyle("normal");

                            return
                        }
                        setFontStyle("bold");
                    }}>
                        {fontStyle == "bold" ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M4 3C4 2.44772 4.44772 2 5 2H10.5C12.9853 2 15 4.01472 15 6.5C15 7.4786 14.6876 8.38423 14.1572 9.12264C15.2818 10.0395 16 11.4359 16 13C16 15.7614 13.7614 18 11 18H5C4.44772 18 4 17.5523 4 17V3ZM10.5 8C11.3284 8 12 7.32843 12 6.5C12 5.67157 11.3284 5 10.5 5H7V8H10.5ZM7 11V15H11C12.1046 15 13 14.1046 13 13C13 11.8954 12.1046 11 11 11H7Z" fill="#12A3F8"/>
                            </svg>
                            
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M4 3C4 2.44772 4.44772 2 5 2H10.5C12.9853 2 15 4.01472 15 6.5C15 7.4786 14.6876 8.38423 14.1572 9.12264C15.2818 10.0395 16 11.4359 16 13C16 15.7614 13.7614 18 11 18H5C4.44772 18 4 17.5523 4 17V3ZM10.5 8C11.3284 8 12 7.32843 12 6.5C12 5.67157 11.3284 5 10.5 5H7V8H10.5ZM7 11V15H11C12.1046 15 13 14.1046 13 13C13 11.8954 12.1046 11 11 11H7Z" fill="#7B828E"/>
                            </svg>
                        )}
                    </button>
                    <button className={styles.styleButton} onClick={() => {
                        if (fontStyle == "italic") {
                            setFontStyle("normal");

                            return
                        }
                        setFontStyle("italic");
                    }}>
                        {fontStyle == "italic" ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.99998 3C6.99998 2.44772 7.4477 2 7.99998 2H16C16.5523 2 17 2.44772 17 3C17 3.55228 16.5523 4 16 4H12.7543L9.32572 16H12C12.5523 16 13 16.4477 13 17C13 17.5523 12.5523 18 12 18H4C3.44772 18 3 17.5523 3 17C3 16.4477 3.44772 16 4 16H7.24568L10.6743 4H7.99998C7.4477 4 6.99998 3.55228 6.99998 3Z" fill="#12A3F8"/>
                            </svg>
                            
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.99998 3C6.99998 2.44772 7.4477 2 7.99998 2H16C16.5523 2 17 2.44772 17 3C17 3.55228 16.5523 4 16 4H12.7543L9.32572 16H12C12.5523 16 13 16.4477 13 17C13 17.5523 12.5523 18 12 18H4C3.44772 18 3 17.5523 3 17C3 16.4477 3.44772 16 4 16H7.24568L10.6743 4H7.99998C7.4477 4 6.99998 3.55228 6.99998 3Z" fill="#7B828E"/>
                            </svg>

                        )}
                    </button>

                    <button className={styles.styleButton} onClick={() => {
                        if (fontDecoration == "underline") {
                            setFontDecoration("normal");

                            return
                        }
                        setFontDecoration("underline");
                    }}>
                        {fontDecoration == "underline" ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M5 2C5.55228 2 6 2.44772 6 3V10C6 12.2091 7.79086 14 10 14C12.2091 14 14 12.2091 14 10V3C14 2.44772 14.4477 2 15 2C15.5523 2 16 2.44772 16 3V10C16 13.3137 13.3137 16 10 16C6.68629 16 4 13.3137 4 10V3C4 2.44772 4.44772 2 5 2Z" fill="#12A3F8"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 17.5C3 17.2239 3.22386 17 3.5 17H16.5C16.7761 17 17 17.2239 17 17.5C17 17.7761 16.7761 18 16.5 18H3.5C3.22386 18 3 17.7761 3 17.5Z" fill="#12A3F8"/>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M5 2C5.55228 2 6 2.44772 6 3V10C6 12.2091 7.79086 14 10 14C12.2091 14 14 12.2091 14 10V3C14 2.44772 14.4477 2 15 2C15.5523 2 16 2.44772 16 3V10C16 13.3137 13.3137 16 10 16C6.68629 16 4 13.3137 4 10V3C4 2.44772 4.44772 2 5 2Z" fill="#7B828E"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 17.5C3 17.2239 3.22386 17 3.5 17H16.5C16.7761 17 17 17.2239 17 17.5C17 17.7761 16.7761 18 16.5 18H3.5C3.22386 18 3 17.7761 3 17.5Z" fill="#7B828E"/>
                            </svg>
                        )}
                    </button>

                    <button className={styles.styleButton} onClick={() => {
                        if (fontDecoration == "line-through") {
                            setFontDecoration("normal");

                            return
                        }
                        setFontDecoration("line-through");
                    }}>
                        {fontDecoration == "line-through" ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 10.5C3 10.2239 3.22386 10 3.5 10H16.5C16.7761 10 17 10.2239 17 10.5C17 10.7761 16.7761 11 16.5 11H3.5C3.22386 11 3 10.7761 3 10.5Z" fill="#12A3F8"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.52786 2C6.30334 2 4.50001 3.80333 4.50001 6.02786C4.50001 7.17788 4.9893 8.24981 5.80919 9H10.2361L7.70808 7.88262C6.97371 7.55804 6.50001 6.83075 6.50001 6.02786C6.50001 4.9079 7.40791 4 8.52786 4H11.3801C12.3006 4 13.142 4.52004 13.5536 5.3433L13.6056 5.44721C13.8526 5.94119 14.4532 6.14142 14.9472 5.89443C15.4412 5.64744 15.6414 5.04676 15.3944 4.55279L15.3425 4.44888C14.5921 2.94804 13.0581 2 11.3801 2H8.52786ZM15.0342 12H12.0764L12.3419 12.1174C13.0763 12.442 13.55 13.1692 13.55 13.9721C13.55 15.0921 12.6421 16 11.5222 16H8.63315C7.70459 16 6.85573 15.4754 6.44046 14.6448L6.39443 14.5528C6.14744 14.0588 5.54677 13.8586 5.05279 14.1056C4.55881 14.3526 4.35859 14.9532 4.60558 15.4472L4.65161 15.5393C5.40566 17.0474 6.94705 18 8.63315 18H11.5222C13.7467 18 15.55 16.1967 15.55 13.9721C15.55 13.2666 15.3659 12.5905 15.0342 12Z" fill="#12A3F8"/>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 10.5C3 10.2239 3.22386 10 3.5 10H16.5C16.7761 10 17 10.2239 17 10.5C17 10.7761 16.7761 11 16.5 11H3.5C3.22386 11 3 10.7761 3 10.5Z" fill="#7B828E"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.52786 2C6.30334 2 4.50001 3.80333 4.50001 6.02786C4.50001 7.17788 4.9893 8.24981 5.80919 9H10.2361L7.70808 7.88262C6.97371 7.55804 6.50001 6.83075 6.50001 6.02786C6.50001 4.9079 7.40791 4 8.52786 4H11.3801C12.3006 4 13.142 4.52004 13.5536 5.3433L13.6056 5.44721C13.8526 5.94119 14.4532 6.14142 14.9472 5.89443C15.4412 5.64744 15.6414 5.04676 15.3944 4.55279L15.3425 4.44888C14.5921 2.94804 13.0581 2 11.3801 2H8.52786ZM15.0342 12H12.0764L12.3419 12.1174C13.0763 12.442 13.55 13.1692 13.55 13.9721C13.55 15.0921 12.6421 16 11.5222 16H8.63315C7.70459 16 6.85573 15.4754 6.44046 14.6448L6.39443 14.5528C6.14744 14.0588 5.54677 13.8586 5.05279 14.1056C4.55881 14.3526 4.35859 14.9532 4.60558 15.4472L4.65161 15.5393C5.40566 17.0474 6.94705 18 8.63315 18H11.5222C13.7467 18 15.55 16.1967 15.55 13.9721C15.55 13.2666 15.3659 12.5905 15.0342 12Z" fill="#7B828E"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            <div>
                <label>Aligment</label>
                <div className={styles.styleWrapper}>
                    <button className={styles.styleButton} onClick={() => {
                        if (textAlign == "left") {
                            setTextAlign("normal");

                            return
                        }
                        setTextAlign("left");
                    }}>
                        {textAlign == "left" ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 3C2.44772 3 2 3.44772 2 4C2 4.55228 2.44772 5 3 5H17C17.5523 5 18 4.55228 18 4C18 3.44772 17.5523 3 17 3H3ZM3 7C2.44772 7 2 7.44772 2 8C2 8.55228 2.44772 9 3 9H13C13.5523 9 14 8.55228 14 8C14 7.44772 13.5523 7 13 7H3ZM2 12C2 11.4477 2.44772 11 3 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H3C2.44772 13 2 12.5523 2 12ZM3 15C2.44772 15 2 15.4477 2 16C2 16.5523 2.44772 17 3 17H13C13.5523 17 14 16.5523 14 16C14 15.4477 13.5523 15 13 15H3Z" fill="#12A3F8"/>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 3C2.44772 3 2 3.44772 2 4C2 4.55228 2.44772 5 3 5H17C17.5523 5 18 4.55228 18 4C18 3.44772 17.5523 3 17 3H3ZM3 7C2.44772 7 2 7.44772 2 8C2 8.55228 2.44772 9 3 9H13C13.5523 9 14 8.55228 14 8C14 7.44772 13.5523 7 13 7H3ZM2 12C2 11.4477 2.44772 11 3 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H3C2.44772 13 2 12.5523 2 12ZM3 15C2.44772 15 2 15.4477 2 16C2 16.5523 2.44772 17 3 17H13C13.5523 17 14 16.5523 14 16C14 15.4477 13.5523 15 13 15H3Z" fill="#7B828E"/>
                            </svg>
                        )}
                    </button>

                    <button className={styles.styleButton} onClick={() => {
                        if (textAlign == "center") {
                            setTextAlign("normal");

                            return
                        }
                        setTextAlign("center");
                    }}>
                        {textAlign == "center" ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 3C2.44772 3 2 3.44772 2 4C2 4.55228 2.44772 5 3 5H17C17.5523 5 18 4.55228 18 4C18 3.44772 17.5523 3 17 3H3ZM5 7C4.44772 7 4 7.44772 4 8C4 8.55228 4.44772 9 5 9H15C15.5523 9 16 8.55228 16 8C16 7.44772 15.5523 7 15 7H5ZM2 12C2 11.4477 2.44772 11 3 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H3C2.44772 13 2 12.5523 2 12ZM5 15C4.44772 15 4 15.4477 4 16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16C16 15.4477 15.5523 15 15 15H5Z" fill="#12A3F8"/>
                            </svg>                            
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 3C2.44772 3 2 3.44772 2 4C2 4.55228 2.44772 5 3 5H17C17.5523 5 18 4.55228 18 4C18 3.44772 17.5523 3 17 3H3ZM5 7C4.44772 7 4 7.44772 4 8C4 8.55228 4.44772 9 5 9H15C15.5523 9 16 8.55228 16 8C16 7.44772 15.5523 7 15 7H5ZM2 12C2 11.4477 2.44772 11 3 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H3C2.44772 13 2 12.5523 2 12ZM5 15C4.44772 15 4 15.4477 4 16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16C16 15.4477 15.5523 15 15 15H5Z" fill="#7B828E"/>
                            </svg>
                        )}
                    </button>

                    <button className={styles.styleButton} onClick={() => {
                        if (textAlign == "right") {
                            setTextAlign("normal");

                            return
                        }
                        setTextAlign("right");
                    }}>
                        {textAlign == "right" ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 3C2.44772 3 2 3.44772 2 4C2 4.55228 2.44772 5 3 5H17C17.5523 5 18 4.55228 18 4C18 3.44772 17.5523 3 17 3H3ZM7 7C6.44772 7 6 7.44772 6 8C6 8.55228 6.44771 9 7 9H17C17.5523 9 18 8.55228 18 8C18 7.44772 17.5523 7 17 7H7ZM2 12C2 11.4477 2.44772 11 3 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H3C2.44772 13 2 12.5523 2 12ZM7 15C6.44772 15 6 15.4477 6 16C6 16.5523 6.44771 17 7 17H17C17.5523 17 18 16.5523 18 16C18 15.4477 17.5523 15 17 15H7Z" fill="#12A3F8"/>
                            </svg> 
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3 3C2.44772 3 2 3.44772 2 4C2 4.55228 2.44772 5 3 5H17C17.5523 5 18 4.55228 18 4C18 3.44772 17.5523 3 17 3H3ZM7 7C6.44772 7 6 7.44772 6 8C6 8.55228 6.44771 9 7 9H17C17.5523 9 18 8.55228 18 8C18 7.44772 17.5523 7 17 7H7ZM2 12C2 11.4477 2.44772 11 3 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H3C2.44772 13 2 12.5523 2 12ZM7 15C6.44772 15 6 15.4477 6 16C6 16.5523 6.44771 17 7 17H17C17.5523 17 18 16.5523 18 16C18 15.4477 17.5523 15 17 15H7Z" fill="#7B828E"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            <div className={styles.colorWrapper}>
                <label className={styles.colorLabel}>Color</label>
                <div className={styles.colorChoose}>{color}</div>
                <input
                    className={styles.colorInput}
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
            </div>
        </div>
    );
};

export default TextSettingsMenu;
