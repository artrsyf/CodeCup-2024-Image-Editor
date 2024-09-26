package models

import "time"

type Session struct {
	ID         int       `json:"id"`
	JWT        string    `json:"token"`
	JWTRefresh string    `json:"refresh_token"`
	UserID     int       `json:"userId"`
	ExpiresAt  time.Time `json:"expires"`
}
