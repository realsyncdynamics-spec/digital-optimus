package desktop

import (
	"log"

	"github.com/go-vgo/robotgo"
	hook "github.com/robotn/gohook"
)

type HotkeyHandler struct {
	onToggle func()
}

func NewHotkeyHandler(onToggle func()) *HotkeyHandler {
	return &HotkeyHandler{onToggle: onToggle}
}

func (h *HotkeyHandler) Listen() {
	log.Println("[Hotkey] Listening for Ctrl+Alt+O to toggle session")

	robotgo.EventHook(hook.KeyDown, []string{"ctrl", "alt", "o"}, func(e hook.Event) {
		log.Println("[Hotkey] Toggle triggered")
		if h.onToggle != nil {
			h.onToggle()
		}
	})

	s := robotgo.EventStart()
	<-robotgo.EventProcess(s)
}

func (h *HotkeyHandler) Stop() {
	robotgo.EventEnd()
	log.Println("[Hotkey] Listener stopped")
}
