package desktop

import (
	"context"
	"fmt"
	"log"
	"time"
)

type SessionConfig struct {
	Interval      time.Duration
	ScreenshotDir string
}

type Session struct {
	config  SessionConfig
	screen  *Screen
	input   *Input
	running bool
	count   int
}

func NewSession(cfg SessionConfig) *Session {
	return &Session{
		config: cfg,
		screen: NewScreen(),
		input:  NewInput(),
	}
}

func (s *Session) Run(ctx context.Context) {
	ticker := time.NewTicker(s.config.Interval)
	defer ticker.Stop()

	s.running = true
	log.Println("[Session] Started")

	for {
		select {
		case <-ctx.Done():
			s.running = false
			log.Println("[Session] Stopped")
			return
		case t := <-ticker.C:
			s.count++
			filename := fmt.Sprintf("%s/capture_%04d.png", s.config.ScreenshotDir, s.count)
			if err := s.screen.Capture(filename); err != nil {
				log.Printf("[Session] Capture error: %v", err)
				continue
			}
			log.Printf("[Session] #%d captured at %s -> %s", s.count, t.Format("15:04:05"), filename)
			w, h := s.screen.Size()
			s.input.MoveMouse(w/2, h/2)
		}
	}
}
