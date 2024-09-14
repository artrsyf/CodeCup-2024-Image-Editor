import { FC, useState } from 'react';

import ImageProcessor from "../ImageProcessor/ImageProcessor"

import styles from './assets/ImageUploader.module.css';

const ImageUploader: FC = () => {
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024
  const [image, setImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploaded, setUploadedStatus] = useState(false)
  const [hover, setHover] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      alert("Upload file should be 5 MB Max");
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
      alert("Should be PNG or JPEG");
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
    console.log(isUploaded)
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDeleteImage = () => {
    setImage(null);
    setUploadedStatus(false);
    setIsEditing(false);
    setDragOver(false);
    setHover(false);
    console.log(1)
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
    <div className={`${styles.uploadContainer} ${isEditing ? styles.dimmed : ''}`}>
      {!isEditing ? (
        <div
          className={`${styles.uploadZoneSize} ${dragOver ? styles.dragOver : ""} ${!isUploaded ? styles.uploadZoneAppearance : ""}`}
          onClick={!isUploaded ? handleReplaceImage: undefined}
          onDrop={!isUploaded ? handleDrop : undefined}
          onDragOver={!isUploaded ? handleDragOver : undefined}
          onDragLeave={!isUploaded ? handleDragLeave : undefined}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {image ? (
            <div className={styles.functionalWrapper}>
              <div className={styles.settingsPanelWrapper}>
                <div className={styles.settingsPanel}>
                  <div className={styles.toolNaming}>Image</div>
                  <div onClick={handleReplaceImage} className={styles.toolButton}>
                    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M1 1C1.55228 1 2 1.44772 2 2V5H5C5.55228 5 6 5.44772 6 6C6 6.55229 5.55228 7 5 7H1C0.447715 7 1.07725e-07 6.55229 1.07725e-07 6V2C1.07725e-07 1.44772 0.447715 1 1 1Z" fill="#7B828E"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M10 8C10 7.44772 10.4477 7 11 7H15C15.5523 7 16 7.44772 16 8V12C16 12.5523 15.5523 13 15 13C14.4477 13 14 12.5523 14 12V9H11C10.4477 9 10 8.55229 10 8Z" fill="#7B828E"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M6.12208 0.27933C7.22033 -0.0535541 8.38233 -0.0896178 9.49816 0.174943C10.6137 0.439448 11.6425 0.994715 12.4899 1.784C13.337 2.57302 13.9755 3.57001 14.3502 4.67953C14.5269 5.20279 14.2459 5.77021 13.7227 5.94691C13.1994 6.12361 12.632 5.84267 12.4553 5.31942C12.1845 4.51749 11.7259 3.80552 11.1268 3.24754C10.528 2.68982 9.80839 2.30395 9.03675 2.12099C8.26535 1.93809 7.46271 1.96283 6.70222 2.19334C5.94145 2.42393 5.24374 2.85422 4.67635 3.44908C4.66913 3.45665 4.6618 3.4641 4.65435 3.47144L1.70162 6.37887C1.30809 6.76636 0.674943 6.76147 0.287449 6.36794C-0.100045 5.9744 -0.0951511 5.34126 0.29838 4.95376L3.24037 2.0569C4.0389 1.22368 5.02926 0.610569 6.12208 0.27933ZM15.7126 7.63206C16.1 8.02559 16.0952 8.65874 15.7016 9.04623L12.7596 11.9431C11.9611 12.7763 10.9707 13.3894 9.87792 13.7207C8.77967 14.0536 7.61767 14.0896 6.50184 13.8251C5.38626 13.5606 4.35754 13.0053 3.51011 12.216C2.66296 11.427 2.02452 10.43 1.64984 9.32047C1.47314 8.79721 1.75407 8.22979 2.27733 8.05309C2.80058 7.87639 3.36801 8.15733 3.54471 8.68058C3.81552 9.48251 4.27412 10.1945 4.87321 10.7525C5.47202 11.3102 6.19161 11.6961 6.96325 11.879C7.73465 12.0619 8.53729 12.0372 9.29778 11.8067C10.0585 11.5761 10.7563 11.1458 11.3237 10.5509C11.3309 10.5434 11.3382 10.5359 11.3457 10.5286L14.2984 7.62113C14.6919 7.23364 15.3251 7.23853 15.7126 7.63206Z" fill="#7B828E"/>
                    </svg>
                  </div>
                  <div onClick={handleOpenEditor} className={styles.toolButton}>
                    {dragOver}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M15 14C15.5523 14 16 14.4477 16 15C16 15.5523 15.5523 16 15 16H1C0.447715 16 0 15.5523 0 15C0 14.4477 0.447715 14 1 14H15ZM4.29289 7.29289L11.2929 0.292893C11.6534 -0.0675907 12.2206 -0.0953203 12.6129 0.209705L12.7071 0.292893L15.7071 3.29289C16.0676 3.65338 16.0953 4.22061 15.7903 4.6129L15.7071 4.70711L8.70711 11.7071C8.55083 11.8634 8.34815 11.9626 8.13144 11.9913L8 12H5C4.48716 12 4.06449 11.614 4.00673 11.1166L4 11V8C4 7.77899 4.07316 7.56552 4.20608 7.39197L4.29289 7.29289L11.2929 0.292893L4.29289 7.29289ZM12 2.41406L6 8.41406V9.99985H7.58579L13.5858 3.99985L12 2.41406Z" fill="#7B828E"/>
                    </svg>
                  </div>
                  <div onClick={handleDeleteImage} className={styles.toolButton}>
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6C12.5523 6 13 6.44772 13 7V13C13 14.6569 11.6569 16 10 16H4C2.34315 16 1 14.6569 1 13V7C1 6.44772 1.44772 6 2 6H12ZM11 8H3V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V8ZM4 1C4 0.447715 4.44772 0 5 0H9C9.55229 0 10 0.447715 10 1V2H13C13.5523 2 14 2.44772 14 3C14 3.55228 13.5523 4 13 4H1C0.447715 4 0 3.55228 0 3C0 2.44772 0.447715 2 1 2H4V1Z" fill="#F93C00"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className={styles.canvasContainer}>
                <img src={image} alt="Uploaded" className={styles.uploadedImage} />
              </div>
            </div>
          ) : ( 
            <div className={styles.dropBoxContainer}>
              <div className={styles.dropBoxContainerIcon}>
                {hover || dragOver ? (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="20" fill="#12A3F8"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M20 12C19.4477 12 19 12.4477 19 13V19H13C12.4477 19 12 19.4477 12 20C12 20.5523 12.4477 21 13 21H19V27C19 27.5523 19.4477 28 20 28C20.5523 28 21 27.5523 21 27V21H27C27.5523 21 28 20.5523 28 20C28 19.4477 27.5523 19 27 19H21V13C21 12.4477 20.5523 12 20 12Z" fill="white"/>
                  </svg>
                ) : (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="20" fill="#F2F5F7"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M20 12C19.4477 12 19 12.4477 19 13V19H13C12.4477 19 12 19.4477 12 20C12 20.5523 12.4477 21 13 21H19V27C19 27.5523 19.4477 28 20 28C20.5523 28 21 27.5523 21 27V21H27C27.5523 21 28 20.5523 28 20C28 19.4477 27.5523 19 27 19H21V13C21 12.4477 20.5523 12 20 12Z" fill="#7B828E"/>
                  </svg>
                )}
              </div>
              <div className={styles.dropBoxContainerMainText}>Drop file to upload or select file</div>
              <div className={styles.dropBoxContainerSubText}>5 MB Max, JPEG, PNG</div>
            </div>
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