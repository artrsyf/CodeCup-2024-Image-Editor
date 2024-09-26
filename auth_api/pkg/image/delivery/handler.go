package delivery

import (
	"net/http"

	ImageRepository "auth_api/pkg/image/repository"
	userRepository "auth_api/pkg/user/repository"

	"github.com/minio/minio-go/v7"
)

type ImageHandler struct {
	UserRepo  userRepository.UserRepo
	ImageRepo ImageRepository.ImageRepo
}

func (h *ImageHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	// Ограничение на размер загружаемого файла (например, 10MB)
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Error parsing multipart form", http.StatusBadRequest)
		return
	}

	// Получаем файл из формы
	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Создаем уникальное имя для файла
	fileName := handler.Filename
	contentType := handler.Header.Get("Content-Type")

	// Загрузка файла в MinIO
	err = h.ImageRepo.UploadImage("your-bucket-name", fileName, file, handler.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		http.Error(w, "Error uploading file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
