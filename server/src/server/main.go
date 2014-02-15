package main

import (
        "time"
        "fmt"
)

const (
        MAX_CLIENTS = 100
        MAX_FPS = 60
        FRAME_DURATION = time.Second / MAX_FPS
)

var characters map[string]*Character
func updateCharacters(k float64) {
        for _, c := range characters {
                c.update(k)
        }
}
func mainLoop() {
        var k float64
        for {
                frameStart := time.Now()

                updateCharacters(k);

                duration := time.Now().Sub(frameStart)
                if duration > 0 && duration < FRAME_DURATION {
                        time.Sleep(FRAME_DURATION - duration)
                }
                ellapsed := time.Now().Sub(frameStart);
                k = float64(ellapsed) / float64(time.Second);
        }
}

func main() {
        characters = make(map[string]*Character, MAX_CLIENTS)
        fmt.Println("Server started at ", time.Now())
	go NanoHandler()
        mainLoop()
}
