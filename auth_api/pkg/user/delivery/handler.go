package delivery

import (
	"auth_api/pkg/models"
	sessionRepository "auth_api/pkg/session/repository"
	userRepository "auth_api/pkg/user/repository"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"auth_api/pkg/tools"

	"github.com/dgrijalva/jwt-go"
)

type Claims struct {
	UserID int `json:"user_id"`
	jwt.StandardClaims
}

type AuthForm struct {
	Login    string `json:"username"`
	Password string `json:"password"`
}

type UserHandler struct {
	UserRepo    userRepository.UserRepo
	SessionRepo sessionRepository.SessionManager
}

func (h *UserHandler) Signup(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	defer r.Body.Close()
	if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "UserHandler.Signup")
		return
	}

	authForm := &AuthForm{}
	err = json.Unmarshal(body, authForm)
	if err != nil {
		tools.JSONError(w, http.StatusUnauthorized, "bad login or pass", "UserHandler.Signup")
		return
	}

	user, err := h.UserRepo.CreateUser(authForm.Login, authForm.Password)
	if err != nil {
		tools.JSONError(w, http.StatusUnauthorized, "couldnt create user:"+err.Error(), "UserRepo.CreateUser")
		return
	}

	tokenString, err := createUserJWT(user, time.Now().Add(15*time.Minute).Unix())
	if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "createUserJWT")
		return
	}

	refreshTokenString, err := createUserJWT(user, time.Now().AddDate(0, 0, 1).Unix())
	if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "createUserJWT")
		return
	}

	err = h.SessionRepo.Create(tokenString, refreshTokenString, user.ID)
	if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "SessionRepo.Create")
		return
	}

	response, err := json.Marshal(map[string]interface{}{
		"authToken": tokenString,
	})
	if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "UserHandler.Signup")
		return
	}

	_, err = w.Write(response)
	if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "UserHandler.Signup")
		return
	}
}

func createUserJWT(user *models.User, expDate int64) (string, error) {
	tokenKey := []byte(os.Getenv("TOKEN_KEY"))
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user": map[string]string{
			"username": user.Login,
			"id":       strconv.Itoa(user.ID),
		},
		"iat": time.Now().Unix(),
		"exp": expDate,
	})
	tokenString, err := token.SignedString(tokenKey)

	return tokenString, err
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	r.Body.Close()
	if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "UserHandler.Login")
		return
	}

	authForm := &AuthForm{}
	err = json.Unmarshal(body, authForm)
	if err != nil {
		tools.JSONError(w, http.StatusBadRequest, "cant unpack payload", "UserHandler.Login")
		return
	}

	user, err := h.UserRepo.GetUserFromRepo(authForm.Login, authForm.Password)
	if err != nil {
		tools.JSONError(w, http.StatusBadRequest, err.Error(), "UserRepo.GetUserFromRepo")
		return
	}

	tokenString, err := createUserJWT(user, time.Now().Add(15*time.Minute).Unix())
	if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "createUserJWT")
		return
	}

	refreshTokenString, err := createUserJWT(user, time.Now().AddDate(0, 0, 1).Unix())
	if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "createUserJWT")
		return
	}

	_, err = h.SessionRepo.Check(user.ID)
	if err == models.ErrNoSession {
		if createSessionErr := h.SessionRepo.Create(tokenString, refreshTokenString, user.ID); createSessionErr != nil {
			tools.JSONError(w, http.StatusInternalServerError, err.Error(), "SessionRepo.Create")
			return
		}
	} else if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "SessionRepo.Check")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:    "token",
		Value:   tokenString,
		Path:    "/",
		Expires: time.Now().Add(15 * time.Minute),
		Secure:  false,
	})
	http.SetCookie(w, &http.Cookie{
		Name:    "refresh_token",
		Value:   refreshTokenString,
		Path:    "/",
		Expires: time.Now().Add(24 * time.Hour),
		Secure:  false,
	})
	http.SetCookie(w, &http.Cookie{
		Name:   "userID",
		Value:  strconv.Itoa(user.ID),
		Path:   "/",
		Secure: false,
	})

	response, err := json.Marshal(map[string]interface{}{
		"accessToken": tokenString,
	})
	if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "UserHandler.Login")
		return
	}

	_, err = w.Write(response)
	if err != nil {
		tools.JSONError(w, http.StatusInternalServerError, err.Error(), "UserHandler.Login")
		return
	}
}

func (h *UserHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("refresh_token")
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusForbidden)
			return
		}
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	userIDCookie, err := r.Cookie("userID")
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusForbidden)
			return
		}
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	userID, _ := strconv.Atoi(userIDCookie.Value)

	refreshToken := c.Value

	tokenKey := []byte(os.Getenv("TOKEN_KEY"))

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		method, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok || method.Alg() != "HS256" {
			return nil, errors.New("bad sign method")
		}

		return tokenKey, nil
	})

	if err != nil || !token.Valid {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	user, _ := h.UserRepo.GetUserByID(userID)
	authToken, err := createUserJWT(user, time.Now().Add(15*time.Minute).Unix())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Проверяем, истек ли refresh token
	if time.Unix(claims.ExpiresAt, 0).Sub(time.Now()) < 0 {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Обновляем токен в куках
	http.SetCookie(w, &http.Cookie{
		Name:    "token",
		Path:    "/",
		Value:   authToken,
		Expires: time.Now().Add(15 * time.Minute),
	})

	if err := json.NewEncoder(w).Encode(map[string]string{"accessToken": authToken}); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (h *UserHandler) GetAccess(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}
