package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/realsyncdynamics-spec/digital-optimus/go-agent/internal/desktop"
)

const (
	version       = "0.1.0"
	captureInterval = 3 * time.Second
	screenshotDir  = "./screenshots"
)

func main() {
	fmt.Printf("Digital Optimus Desktop Client v%s\n", version)
	fmt.Println("Press Ctrl+C to stop")

	// Ensure screenshot directory exists
	if err := os.MkdirAll(screenshotDir, 0755); err != nil {
		log.Fatalf("Failed to create screenshot dir: %v", err)
	}

	// Context with cancellation for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle OS signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	var wg sync.WaitGroup

	// Start session
	session := desktop.NewSession(desktop.SessionConfig{
		Interval:      captureInterval,
		ScreenshotDir: screenshotDir,
	})

	wg.Add(1)
	go func() {
		defer wg.Done()
		session.Run(ctx)
	}()

	fmt.Println("Session started. Capturing screen...")

	// Wait for shutdown signal
	<-sigChan
	fmt.Println("\nShutting down...")
	cancel()
	wg.Wait()
	fmt.Println("Goodbye.")
}
