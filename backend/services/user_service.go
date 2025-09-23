package services

import (
	"database/sql"
	"fmt"
	"time"

	"punchard.com/backend/database"
	"punchard.com/backend/models"
)

// UserService handles user-related database operations
type UserService struct{}

// NewUserService creates a new UserService instance
func NewUserService() *UserService {
	return &UserService{}
}

// CreateUser creates a new user in the database
func (s *UserService) CreateUser(userReq models.CreateUserRequest) (*models.User, error) {
	query := `
		INSERT INTO users (username, password, first_name, last_name, email, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)`

	now := time.Now()
	result, err := database.DB.Exec(query, userReq.Username, userReq.Password,
		userReq.FirstName, userReq.LastName, userReq.Email, now, now)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %v", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert id: %v", err)
	}

	user := &models.User{
		ID:        int(id),
		Username:  userReq.Username,
		Password:  userReq.Password,
		FirstName: userReq.FirstName,
		LastName:  userReq.LastName,
		Email:     userReq.Email,
		CreatedAt: now,
		UpdatedAt: now,
	}

	return user, nil
}

// GetUserByID retrieves a user by their ID
func (s *UserService) GetUserByID(id int) (*models.User, error) {
	query := `SELECT id, username, password, first_name, last_name, email, created_at, updated_at 
			  FROM users WHERE id = ?`

	user := &models.User{}
	err := database.DB.QueryRow(query, id).Scan(
		&user.ID, &user.Username, &user.Password, &user.FirstName,
		&user.LastName, &user.Email, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %v", err)
	}

	return user, nil
}

// GetUserByUsername retrieves a user by their username
func (s *UserService) GetUserByUsername(username string) (*models.User, error) {
	query := `SELECT id, username, password, first_name, last_name, email, created_at, updated_at 
			  FROM users WHERE username = ?`

	user := &models.User{}
	err := database.DB.QueryRow(query, username).Scan(
		&user.ID, &user.Username, &user.Password, &user.FirstName,
		&user.LastName, &user.Email, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %v", err)
	}

	return user, nil
}

// GetUserByEmail retrieves a user by their email
func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	query := `SELECT id, username, password, first_name, last_name, email, created_at, updated_at 
			  FROM users WHERE email = ?`

	user := &models.User{}
	err := database.DB.QueryRow(query, email).Scan(
		&user.ID, &user.Username, &user.Password, &user.FirstName,
		&user.LastName, &user.Email, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %v", err)
	}

	return user, nil
}

// GetAllUsers retrieves all users from the database
func (s *UserService) GetAllUsers() ([]models.User, error) {
	query := `SELECT id, username, password, first_name, last_name, email, created_at, updated_at 
			  FROM users ORDER BY created_at DESC`

	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %v", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.ID, &user.Username, &user.Password, &user.FirstName,
			&user.LastName, &user.Email, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %v", err)
		}
		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating users: %v", err)
	}

	return users, nil
}

// UpdateUser updates an existing user
func (s *UserService) UpdateUser(id int, userReq models.UpdateUserRequest) (*models.User, error) {
	// First, get the current user
	currentUser, err := s.GetUserByID(id)
	if err != nil {
		return nil, err
	}

	// Build dynamic update query
	query := "UPDATE users SET updated_at = ?"
	args := []interface{}{time.Now()}

	if userReq.Username != nil {
		query += ", username = ?"
		args = append(args, *userReq.Username)
		currentUser.Username = *userReq.Username
	}
	if userReq.Password != nil {
		query += ", password = ?"
		args = append(args, *userReq.Password)
		currentUser.Password = *userReq.Password
	}
	if userReq.FirstName != nil {
		query += ", first_name = ?"
		args = append(args, *userReq.FirstName)
		currentUser.FirstName = *userReq.FirstName
	}
	if userReq.LastName != nil {
		query += ", last_name = ?"
		args = append(args, *userReq.LastName)
		currentUser.LastName = *userReq.LastName
	}
	if userReq.Email != nil {
		query += ", email = ?"
		args = append(args, *userReq.Email)
		currentUser.Email = *userReq.Email
	}

	query += " WHERE id = ?"
	args = append(args, id)

	_, err = database.DB.Exec(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %v", err)
	}

	currentUser.UpdatedAt = time.Now()
	return currentUser, nil
}

// DeleteUser deletes a user by ID
func (s *UserService) DeleteUser(id int) error {
	query := "DELETE FROM users WHERE id = ?"
	result, err := database.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}
