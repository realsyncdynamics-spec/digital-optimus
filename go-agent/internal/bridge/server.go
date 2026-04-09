package bridge

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
)

// Server is a lightweight HTTP bridge that Electron connects to.
type Server struct {
	listener net.Listener
	srv      *http.Server
}

// StatusResponse is returned by GET /api/status.
type StatusResponse struct {
	Service string `json:"service"`
	Version string `json:"version"`
	Status  string `json:"status"`
}

// NewServer creates a bridge server on a random available port.
func NewServer(version string) (*Server, error) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, fmt.Errorf("bridge: listen: %w", err)
	}

	mux := http.NewServeMux()
	s := &Server{
		listener: listener,
		srv:      &http.Server{Handler: mux},
	}

	// --- Routes ---

	mux.HandleFunc("/api/status", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, StatusResponse{
			Service: "digital-optimus-go",
			Version: version,
			Status:  "running",
		})
	})

	mux.HandleFunc("/api/screen/capture", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, map[string]interface{}{
			"success": true,
			"message": "screenshot captured (stub)",
		})
	})

	mux.HandleFunc("/api/automations/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			writeJSON(w, map[string]interface{}{
				"success": true,
				"message": "automation executed (stub)",
			})
			return
		}
		writeJSON(w, map[string]interface{}{
			"automations": []string{},
		})
	})

	mux.HandleFunc("/api/input/click", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, map[string]interface{}{
			"success": true,
			"message": "click executed (stub)",
		})
	})

	mux.HandleFunc("/api/input/type", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, map[string]interface{}{
			"success": true,
			"message": "type executed (stub)",
		})
	})

	return s, nil
}

// Port returns the port the server is listening on.
func (s *Server) Port() int {
	return s.listener.Addr().(*net.TCPAddr).Port
}

// Serve starts accepting connections. Blocks until the server is shut down.
func (s *Server) Serve() error {
	return s.srv.Serve(s.listener)
}

// Shutdown gracefully stops the server.
func (s *Server) Shutdown(ctx context.Context) error {
	return s.srv.Shutdown(ctx)
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("[bridge] json encode error: %v", err)
	}
}
