package models

import "errors"

var (
	ErrNoSession = errors.New("cant find such session")

	ErrNoUser           = errors.New("no user found")
	ErrWrongCredentials = errors.New("wrong login or password")
	ErrAlreadyCreated   = errors.New("already created")
)
