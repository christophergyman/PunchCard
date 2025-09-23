package main

import (
	"log"
	"net/http"

	"punchard.com/backend/database"
	"punchard.com/backend/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	if err := database.InitDB(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer database.CloseDB()

	// Create tables
	if err := database.CreateTables(); err != nil {
		log.Fatal("Failed to create tables:", err)
	}

	// Initialize Gin router
	r := gin.Default()

	// Initialize handlers
	userHandler := handlers.NewUserHandler()

	// Health check endpoint
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	// User routes
	api := r.Group("/api/v1")
	{
		users := api.Group("/users")
		{
			users.POST("", userHandler.CreateUser)       // POST /api/v1/users
			users.GET("", userHandler.GetAllUsers)       // GET /api/v1/users
			users.GET("/:id", userHandler.GetUser)       // GET /api/v1/users/:id
			users.PUT("/:id", userHandler.UpdateUser)    // PUT /api/v1/users/:id
			users.DELETE("/:id", userHandler.DeleteUser) // DELETE /api/v1/users/:id
		}
	}

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
