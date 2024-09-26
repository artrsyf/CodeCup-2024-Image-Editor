package repository

import "auth_api/pkg/models"

//go:generate mockgen -source=repository.go -destination=mock_repository/session_mock.go -package=mock_repository MockSessionManager
type SessionManager interface {
	Create(JWTAuthToken string, JWTRefreshToken string, userID int) error
	Check(userID int) (*models.Session, error)
	Delete(userID int) error
}
