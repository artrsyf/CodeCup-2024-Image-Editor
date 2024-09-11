import { FC, useState } from 'react';

import styles from './assets/ImageUploader.module.css';

const ImageUploader: FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Пожалуйста, загрузите изображение.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className={styles.uploadContainer}>
      <div 
        className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ""}`}
        onClick={() => document.getElementById("fileInput")?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        >
          {image ? (
            <img src={image} alt="Uploaded" className={styles.uploadedImage} />
          ) : (
            <p>Перетащите сюда изображение или нажмите, чтобы выбрать файл</p>
          )}
      </div>
      <input
          type="file"
          id="fileInput"
          className={styles.hiddenFileInput}
          accept="image/jpeg, image/png"
          onChange={handleFileChange}
        />
    </div>
  )
}

export default ImageUploader;