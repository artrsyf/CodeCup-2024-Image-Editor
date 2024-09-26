package repository

import (
	"mime/multipart"

	"github.com/minio/minio-go/v7"
)

type ImageRepo interface {
	UploadImage(bucketName string, fileName string, file multipart.File, objectSize int64, opts minio.PutObjectOptions) error
}
