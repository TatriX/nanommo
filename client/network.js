var host = (location.host == "localhost") ? "localhost" :  "54.229.106.82";

var websocket = new WebSocket("ws://" + host + ":48888/");
websocket.onopen = function() {
    print("Connection opened.");

    websocket.onclose = function() {
        alert("Disconnected");
    }

    player = new Character;

    var defaultName = localStorage.getItem("nanommo.name");
    if (!defaultName)
        defaultName = "Anonymous";

    player.name = prompt("Name?", defaultName);
    localStorage.setItem("nanommo.name", player.name);

    characters[player.name] = player;
    network.send("login", player.name);
    tick();
}

websocket.onerror = function(e) {
    alert("Cannot connect to server");
}

var network = {
    data: [],
    send: function(name, data) {
        var msg = name + "|" + JSON.stringify(data);
        websocket.send(msg);
    }
}

websocket.onmessage = function(msg) {
    print("Received: " + msg.data);
    network.data = JSON.parse(msg.data);

    if (network.data.Error) {
        alert(network.data.Error);
        location.reload();
        return;
    }

    sync(network.data);
}
