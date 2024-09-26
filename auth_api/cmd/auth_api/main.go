package main

import (
	"database/sql"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	sessionRepository "auth_api/pkg/session/repository/redis"
	userRepository "auth_api/pkg/user/repository/mysql"

	userDelivery "auth_api/pkg/user/delivery"

	"auth_api/pkg/middleware"

	"github.com/gomodule/redigo/redis"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		slog.Error("Cant load .env file")
	}

	router := mux.NewRouter()

	mysqlDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?",
		os.Getenv("MYSQL_USER"),
		os.Getenv("MYSQL_PASSWORD"),
		os.Getenv("MYSQL_HOST"),
		os.Getenv("MYSQL_PORT"),
		os.Getenv("MYSQL_DATABASE"),
	)
	mysqlDSN += "&charset=utf8"
	mysqlDSN += "&interpolateParams=true"

	mysqlConnect, err := sql.Open("mysql", mysqlDSN)
	if err != nil {
		panic(err)
	}

	mysqlConnect.SetConnMaxLifetime(time.Minute * 3)
	mysqlConnect.SetMaxOpenConns(10)
	mysqlConnect.SetMaxIdleConns(10)

	redisURL := fmt.Sprintf("redis://user:@%s:%s/%s",
		os.Getenv("REDIS_HOST"),
		os.Getenv("REDIS_PORT"),
		os.Getenv("REDIS_DATABASE"),
	)
	redisConn, err := redis.DialURL(redisURL)
	if err != nil {
		panic(err)
	}

	userRepo := userRepository.NewUserMySqlRepo(mysqlConnect)
	sessionRepo := sessionRepository.NewSessionRedisManager(redisConn)

	authHandler := userDelivery.UserHandler{
		UserRepo:    userRepo,
		SessionRepo: sessionRepo,
	}

	router.Handle("/api/login", middleware.ValidateContentType(
		http.HandlerFunc(authHandler.Login))).Methods("POST")

	router.Handle("/api/register", middleware.ValidateContentType(
		http.HandlerFunc(authHandler.Signup))).Methods("POST")

	router.Handle("/api/refresh", middleware.ValidateContentType(
		http.HandlerFunc(authHandler.RefreshToken))).Methods("GET")
}
