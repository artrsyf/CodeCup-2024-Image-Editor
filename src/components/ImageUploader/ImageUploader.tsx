import { FC, useState } from 'react';

import ImageProcessor from "../ImageProcessor/ImageProcessor"

import styles from './assets/ImageUploader.module.css';

const ImageUploader: FC = () => {
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024
  const [image, setImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploaded, setUploadedStatus] = useState(false)
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      alert("Размер файла не должен превышать 5 МБ.");
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setUploadedStatus(true)
      };
      reader.readAsDataURL(file);
    } else {
      alert("Пожалуйста, загрузите изображение.");
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

  const handleDeleteImage = () => {
    setImage(null);
    setUploadedStatus(false);
    setIsEditing(false);
  };

  const handleReplaceImage = () => {
    document.getElementById('fileInput')?.click();
  };

  const handleOpenEditor = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className={styles.uploadContainer}>
      {!isEditing ? (
        <div
          className={`${styles.uploadZoneSize} ${dragOver ? styles.dragOver : ""} ${!isUploaded ? styles.uploadZoneAppearance : ""}`}
          onClick={!isUploaded ? () => document.getElementById('fileInput')?.click() : undefined}
          onDrop={!isUploaded ? handleDrop : undefined}
          onDragOver={!isUploaded ? handleDragOver : undefined}
          onDragLeave={!isUploaded ? handleDragLeave : undefined}
        >
          {image ? (
            <>
              <div className={styles.settingsPanel}>
                <span>Image</span>
                <button onClick={handleReplaceImage} className={styles.toolButton}>Replace</button>
                <button onClick={handleOpenEditor} className={styles.toolButton}>Edit</button>
                <button onClick={handleDeleteImage} className={styles.toolButton}>Delete</button>
              </div>
              <div className={styles.canvasContainer}>
                <img src={image} alt="Uploaded" className={styles.uploadedImage} />
              </div>
            </>
          ) : (
            <p>Перетащите сюда изображение или нажмите, чтобы выбрать файл</p>
          )}
        </div>
      ) : (
        image && <ImageProcessor imageSrc={image} onCancel={handleCancelEdit} />
      )}
      <input
        type="file"
        id="fileInput"
        className={styles.hiddenFileInput}
        accept="image/jpeg, image/png"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default ImageUploader;