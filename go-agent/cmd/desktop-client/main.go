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

	"github.com/realsyncdynamics-spec/digital-optimus/go-agent/internal/bridge"
	"github.com/realsyncdynamics-spec/digital-optimus/go-agent/internal/desktop"
)

const (
	version         = "0.1.0"
	captureInterval = 3 * time.Second
	screenshotDir   = "./screenshots"
)

func main() {
	httpMode := false
	for _, arg := range os.Args[1:] {
		if arg == "--http" {
			httpMode = true
		}
	}

	fmt.Printf("Digital Optimus Desktop Client v%s\n", version)

	// Context with cancellation for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle OS signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	var wg sync.WaitGroup

	// Start HTTP bridge if --http flag is set (Electron will read the port from stdout)
	if httpMode {
		srv, err := bridge.NewServer(version)
		if err != nil {
			log.Fatalf("Failed to start HTTP bridge: %v", err)
		}

		// Print port on stdout so Electron can read it
		fmt.Printf("LISTENING:%d\n", srv.Port())

		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := srv.Serve(); err != nil {
				log.Printf("[bridge] server stopped: %v", err)
			}
		}()

		// Shut down bridge on context cancel
		go func() {
			<-ctx.Done()
			srv.Shutdown(context.Background())
		}()
	} else {
		fmt.Println("Press Ctrl+C to stop")

		// Ensure screenshot directory exists
		if err := os.MkdirAll(screenshotDir, 0755); err != nil {
			log.Fatalf("Failed to create screenshot dir: %v", err)
		}

		// Start capture session
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
	}

	// Wait for shutdown signal
	<-sigChan
	fmt.Println("\nShutting down...")
	cancel()
	wg.Wait()
	fmt.Println("Goodbye.")
}
