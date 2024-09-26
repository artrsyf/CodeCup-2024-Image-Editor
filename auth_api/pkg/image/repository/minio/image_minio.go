package minio

import (
	"context"
	"mime/multipart"

	"github.com/minio/minio-go/v7"
)

type ImageMinioRepository struct {
	storage *minio.Client
}

func NewImageMinioRepository(storage *minio.Client) *ImageMinioRepository {
	return &ImageMinioRepository{
		storage: storage,
	}
}

func (repo *ImageMinioRepository) UploadImage(bucketName string, fileName string, file multipart.File, objectSize int64, opts minio.PutObjectOptions) error {
	_, err := repo.storage.PutObject(context.Background(), bucketName, fileName, file, objectSize, opts)
	return err
}
