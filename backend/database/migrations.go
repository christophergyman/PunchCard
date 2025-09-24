package database

import (
	"fmt"
	"log"
)

// RunMigrations runs all database migrations
func RunMigrations() error {
	if DB == nil {
		return fmt.Errorf("database connection not initialized")
	}

	// Create users table
	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username VARCHAR(50) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		email VARCHAR(100) UNIQUE NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	// Create trigger to automatically update updated_at timestamp
	createUpdateTrigger := `
	CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
	AFTER UPDATE ON users
	BEGIN
		UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
	END;`

	// Create indexes for better performance
	createIndexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);",
		"CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
		"CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);",
	}

	// Execute table creation
	if _, err := DB.Exec(createUsersTable); err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}
	log.Println("Users table created successfully")

	// Execute trigger creation
	if _, err := DB.Exec(createUpdateTrigger); err != nil {
		return fmt.Errorf("failed to create update trigger: %w", err)
	}
	log.Println("Update trigger created successfully")

	// Execute index creation
	for _, indexSQL := range createIndexes {
		if _, err := DB.Exec(indexSQL); err != nil {
			return fmt.Errorf("failed to create index: %w", err)
		}
	}
	log.Println("Database indexes created successfully")

	log.Println("All database migrations completed successfully")
	return nil
}
