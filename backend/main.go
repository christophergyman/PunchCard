package main

import (
	"log"
	"os"

	"punchcard-backend/database"
	"punchcard-backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.CloseDB()

	// Run database migrations
	if err := database.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	router := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:3001"} // Add your frontend URLs
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	router.Use(cors.New(config))

	// Initialize handlers
	userHandler := handlers.NewUserHandler()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "PunchCard API is running",
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// User routes
		users := api.Group("/users")
		{
			users.POST("", userHandler.CreateUser)       // Create user
			users.GET("", userHandler.GetAllUsers)       // Get all users
			users.GET("/:id", userHandler.GetUser)       // Get user by ID
			users.PUT("/:id", userHandler.UpdateUser)    // Update user
			users.DELETE("/:id", userHandler.DeleteUser) // Delete user
		}

		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/login", userHandler.Login) // Login
		}
	}

	// Serve static files (for React frontend)
	router.Static("/static", "./static")
	router.StaticFile("/", "./static/index.html")

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
