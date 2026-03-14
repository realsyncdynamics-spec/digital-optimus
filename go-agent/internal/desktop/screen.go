package desktop

import (
	"fmt"
	"image"
	"image/png"
	"log"
	"os"

	"github.com/go-vgo/robotgo"
)

type Screen struct {
	width  int
	height int
}

func NewScreen() *Screen {
	w, h := robotgo.GetScreenSize()
	log.Printf("[Screen] Detected resolution: %dx%d", w, h)
	return &Screen{width: w, height: h}
}

func (s *Screen) Size() (int, int) {
	return s.width, s.height
}

func (s *Screen) Capture(filename string) error {
	bitmap := robotgo.CaptureScreen(0, 0, s.width, s.height)
	if bitmap == nil {
		return fmt.Errorf("screen capture returned nil bitmap")
	}
	defer robotgo.FreeBitmap(bitmap)

	img := robotgo.ToImage(bitmap)
	if img == nil {
		return fmt.Errorf("failed to convert bitmap to image")
	}

	return saveImage(img, filename)
}

func saveImage(img image.Image, filename string) error {
	f, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("create file: %w", err)
	}
	defer f.Close()

	if err := png.Encode(f, img); err != nil {
		return fmt.Errorf("encode png: %w", err)
	}
	return nil
}
