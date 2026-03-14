package desktop

import (
	"log"
	"time"

	"github.com/go-vgo/robotgo"
)

type Input struct{}

func NewInput() *Input {
	return &Input{}
}

func (i *Input) MoveMouse(x, y int) {
	robotgo.Move(x, y)
	log.Printf("[Input] Mouse moved to (%d, %d)", x, y)
}

func (i *Input) Click() {
	robotgo.Click("left", false)
	log.Println("[Input] Left click")
}

func (i *Input) ClickAt(x, y int) {
	i.MoveMouse(x, y)
	time.Sleep(50 * time.Millisecond)
	i.Click()
}

func (i *Input) DoubleClick() {
	robotgo.Click("left", true)
	log.Println("[Input] Double click")
}

func (i *Input) RightClick() {
	robotgo.Click("right", false)
	log.Println("[Input] Right click")
}

func (i *Input) TypeText(text string) {
	robotgo.TypeStr(text)
	log.Printf("[Input] Typed: %s", text)
}

func (i *Input) KeyTap(key string, modifiers ...string) {
	robotgo.KeyTap(key, modifiers...)
	log.Printf("[Input] KeyTap: %s %v", key, modifiers)
}

func (i *Input) Scroll(direction string, amount int) {
	switch direction {
	case "up":
		robotgo.Scroll(0, amount)
	case "down":
		robotgo.Scroll(0, -amount)
	case "left":
		robotgo.Scroll(-amount, 0)
	case "right":
		robotgo.Scroll(amount, 0)
	}
	log.Printf("[Input] Scroll %s by %d", direction, amount)
}
