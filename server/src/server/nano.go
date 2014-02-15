package main
import (
	"code.google.com/p/go.net/websocket"
        "strings"
	"fmt"
        "io"
	"net/http"
)

const (
        MAX_CMD_SIZE = 1024
        CMD_DELIMITER = "|"
)

var connections map[string]*websocket.Conn

type packet struct {
        Characters *map[string]*Character
        Error string
}

func NanoServer(ws *websocket.Conn) {
        if len(connections) >= MAX_CLIENTS {
                fmt.Println("Cannot handle more requests")
                return;
        }

        addr := ws.Request().RemoteAddr

        connections[addr] = ws
        character := Character{Speed:  CHAR_DEFAULT_SPEED}

        fmt.Printf("Client %s connected [Total clients connected: %d]\n", addr, len(connections))

        cmd := make([]byte, MAX_CMD_SIZE)
        for {
                n, err := ws.Read(cmd)
                if err == io.EOF {
                        fmt.Printf("Client %s (%s) disconnected\n", character.Name, addr)
                        delete(characters, character.Name)
                        delete(connections, addr)
                        break;
                }
                if err != nil {
                        fmt.Println(err)
                        continue
                }

                fmt.Printf("Received %d bytes from %s (%s): %s\n", n, character.Name, addr, cmd[:n])

                opIndex := strings.Index(string(cmd), CMD_DELIMITER);
                if opIndex < 0 {
                        fmt.Println("Malformed command")
                        continue
                }
                op := string(cmd[:opIndex])
                data := cmd[opIndex + len(CMD_DELIMITER):n]

                switch op {
                case "login":
                        var name string
                        websocket.JSON.Unmarshal(data, ws.PayloadType, &name)
                        if _, ok := characters[name]; !ok && len(name) > 0 {
                                character.Name = name;
                                characters[name] = &character
                                fmt.Println(name, " logged in")
                        } else {
                                fmt.Println("Login failure: ", character.Name)
                                go sendError(ws, "Cannot login. Try another name")
                                continue
                        }
                case "set-dst":
                        var p Point
                        if err := websocket.JSON.Unmarshal(data, ws.PayloadType, &p); err != nil {
                                fmt.Println("Unmarshal error: ", err)
                        }
                        character.Dst = p
                default:
                        fmt.Printf("Unknown op: %s\n", op)
                        continue
                }
                go notifyClients()
        }
}

func sendError(ws *websocket.Conn, error string) {
        var packet packet
        packet.Error = error

        msg, _, err := websocket.JSON.Marshal(packet)
        if err != nil {
                fmt.Println(err)
                return
        }

        if _, err := ws.Write(msg); err != nil {
                fmt.Println(err);
        }
}

func notifyClients() {
        var packet packet
        packet.Characters = &characters;

        msg, _, err := websocket.JSON.Marshal(packet)
        if err != nil {
                fmt.Println(err)
                return
        }

        for _, ws := range connections {
                if _, err := ws.Write(msg); err != nil {
                        fmt.Println(err)
                        return
                }
        }
}

func NanoHandler() {
        connections = make(map[string]*websocket.Conn, MAX_CLIENTS);
	fmt.Println("Nano handler started")
	http.Handle("/", websocket.Handler(NanoServer))
	err := http.ListenAndServe(":49000", nil)
	if err != nil {
		panic("ListenAndServe: " + err.Error())
	}
}
