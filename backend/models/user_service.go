package models

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"punchcard-backend/database"
	"punchcard-backend/middleware"

	"github.com/jmoiron/sqlx"
)

// UserService handles user-related database operations
type UserService struct {
	db *sqlx.DB
}

// NewUserService creates a new UserService instance
func NewUserService() *UserService {
	return &UserService{
		db: database.GetDB(),
	}
}

// CreateUser creates a new user in the database
func (s *UserService) CreateUser(req *CreateUserRequest) (*User, error) {
	// Hash the password
	hashedPassword, err := middleware.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Insert user into database
	query := `
		INSERT INTO users (username, password, email, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?)`

	result, err := s.db.Exec(query, req.Username, hashedPassword, req.Email, time.Now(), time.Now())
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Get the ID of the created user
	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID: %w", err)
	}

	// Retrieve the created user
	user, err := s.GetUserByID(int(id))
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve created user: %w", err)
	}

	return user, nil
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(id int) (*User, error) {
	user := &User{}
	query := `SELECT id, username, password, email, created_at, updated_at FROM users WHERE id = ?`

	err := s.db.Get(user, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// GetUserByUsername retrieves a user by username
func (s *UserService) GetUserByUsername(username string) (*User, error) {
	user := &User{}
	query := `SELECT id, username, password, email, created_at, updated_at FROM users WHERE username = ?`

	err := s.db.Get(user, query, username)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// GetUserByEmail retrieves a user by email
func (s *UserService) GetUserByEmail(email string) (*User, error) {
	user := &User{}
	query := `SELECT id, username, password, email, created_at, updated_at FROM users WHERE email = ?`

	err := s.db.Get(user, query, email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// GetAllUsers retrieves all users from the database
func (s *UserService) GetAllUsers() ([]*User, error) {
	var users []*User
	query := `SELECT id, username, password, email, created_at, updated_at FROM users ORDER BY created_at DESC`

	err := s.db.Select(&users, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	return users, nil
}

// UpdateUser updates an existing user
func (s *UserService) UpdateUser(id int, req *UpdateUserRequest) (*User, error) {
	// Build dynamic update query
	setParts := []string{}
	args := []interface{}{}

	if req.Username != "" {
		setParts = append(setParts, "username = ?")
		args = append(args, req.Username)
	}

	if req.Email != "" {
		setParts = append(setParts, "email = ?")
		args = append(args, req.Email)
	}

	if req.Password != "" {
		// Hash the new password
		hashedPassword, err := middleware.HashPassword(req.Password)
		if err != nil {
			return nil, fmt.Errorf("failed to hash password: %w", err)
		}
		setParts = append(setParts, "password = ?")
		args = append(args, hashedPassword)
	}

	if len(setParts) == 0 {
		return nil, fmt.Errorf("no fields to update")
	}

	// Add updated_at
	setParts = append(setParts, "updated_at = ?")
	args = append(args, time.Now())

	// Add ID to args
	args = append(args, id)

	query := fmt.Sprintf("UPDATE users SET %s WHERE id = ?", strings.Join(setParts, ", "))

	result, err := s.db.Exec(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return nil, fmt.Errorf("user not found")
	}

	// Retrieve the updated user
	user, err := s.GetUserByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve updated user: %w", err)
	}

	return user, nil
}

// DeleteUser deletes a user by ID
func (s *UserService) DeleteUser(id int) error {
	query := `DELETE FROM users WHERE id = ?`

	result, err := s.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// VerifyUserPassword verifies a user's password
func (s *UserService) VerifyUserPassword(username, password string) (*User, error) {
	user, err := s.GetUserByUsername(username)
	if err != nil {
		return nil, err
	}

	valid, err := middleware.VerifyPassword(password, user.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to verify password: %w", err)
	}

	if !valid {
		return nil, fmt.Errorf("invalid password")
	}

	return user, nil
}
