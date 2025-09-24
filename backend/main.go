package main

import (
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	fmt.Println("Hello, World!")

	// init database
	db, err := initDB()
	if err != nil {
		log.Fatal("Failed to init db", err)
	}
	defer db.Close()

	// setup Gin router
	r := gin.Default()

	// CORS middleware for development
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // React dev server
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	// api routes
	// API routes
	api := r.Group("/api")
	{
		api.GET("/health", healthCheck)
		api.GET("/users", getUsers(db))
		api.POST("/users", createUser(db))
		// Add more API endpoints here
	}
}
