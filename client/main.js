var canvas = document.createElement("canvas");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
var ctx = canvas.getContext("2d");
var FONT_SIZE = 13;
ctx.font = FONT_SIZE + "px Monospace";
document.body.appendChild(canvas);

var textarea = document.createElement("textarea");
textarea.style.width = canvas.width
textarea.style.height = canvas.height;
textarea.style.position = "absolute";
textarea.style.top = 0;
textarea.style.left = 0;
textarea.style.border = "none";
textarea.style.display = "none";

document.addEventListener("keydown", function(e) {
    if (e.keyCode == 192) // `
        textarea.style.display = (textarea.style.display != "none" ? "none" : "");
})

document.body.appendChild(textarea);

var stats = new Stats();
// stats.setMode(1); // 0: fps, 1: ms

// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild(stats.domElement);

function print(msg) {
    textarea.value += msg + "\n";
}

var host = (location.host == "localhost") ? "localhost" :  "54.229.106.82";

var websocket = new WebSocket("ws://" + host + ":49000/");
websocket.onopen = function() {
    print("Connection opened.");
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

websocket.onclose = function() {
    alert("Disconnected");
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

function Point(x, y) {
    this.X = x || 0;
    this.Y = y || 0;
}

Point.prototype = {
    equals: function(p, epsilon) {
        epsilon = epsilon || 1e-6;
        return Math.abs(this.X - p.X) < epsilon && Math.abs(this.Y - p.Y) < epsilon;
    },
    fromEvent: function(e) {
        this.X = e.pageX;
        this.Y = e.pageY;
        return this;
    },
    fromPoint: function(p) {
        this.X = p.X;
        this.Y = p.Y;
    },
    json: function() {
        return {X: this.X, Y: this.Y};
    }
}

function Map() {
    this.width = canvas.width;
    this.height = canvas.height;
    this.draw = function() {
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, this.width, this.height);
    }
}

function Character() {
    this.Pos = new Point;
    this.Dst = new Point;
    this.Angle = 0;
    this.Speed = 0;
    this.Name = "";
}

Character.prototype = {
    get x() {
        return this.Pos.X;
    },
    get y() {
        return this.Pos.Y;
    },
    set x(x) {
        this.Pos.X = x;
    },
    set y(y) {
        this.Pos.Y = y;
    },
    draw: function() {
        var w = 64, h = 64;
        ctx.fillStyle = (this == player) ? "green" : "red";
        ctx.fillRect(Math.round(this.x - w / 2), Math.round(this.y - h / 2), w, h);
        ctx.fillStyle = "white";
        ctx.fillText(this.Name, this.x - ctx.measureText(this.Name).width / 2, this.y - h / 2 - FONT_SIZE);
    },
    update: function() {
        if (this.Pos.equals(this.Dst, this.Speed * fps.k)) {
            this.Pos.fromPoint(this.Dst);
            return;
        }
        var lenX = this.Dst.X - this.x;
        var lenY = this.Dst.Y - this.y;
        this.Angle = Math.atan2(lenY, lenX);
        var dx = Math.cos(this.Angle) * this.Speed * fps.k;
        var dy = Math.sin(this.Angle) * this.Speed * fps.k;
        this.x += dx;
        this.y += dy;
    },
}

var map = new Map;
var characters = {};
var player = null;

var fps = {
    k: 1,
    lastUpdate: Date.now(),
    update: function() {
        var ellapsed = Date.now() - this.lastUpdate;
        this.lastUpdate = Date.now()
        this.k = ellapsed / 1000;
    }
}

function mapMethod(hash, method) {
    for (var i in hash) {
        hash[i][method]();
    }
}

function copy(to, from) {
    for (var prop in from) {
        if (from[prop] instanceof Object)
            copy(to[prop], from[prop])
        else
            to[prop] = from[prop];
    }
}

function sync(data) {
    if (data.Characters)
        syncCharacters(data.Characters);
}

function syncCharacters(data) {
    for (var name in characters) {
        if (!data[name])
            delete characters[name];
    }

    for (var name in data) {
        var record = data[name];

        if (!characters[name])
            characters[name] = new Character;

        copy(characters[name], record);
    }
}

function update() {
    fps.update();
    mapMethod(characters, "update");
}

function draw() {
    map.draw();
    mapMethod(characters, "draw");
}

function tick() {
    stats.begin();
    update();
    draw();
    stats.end();
    requestAnimationFrame(tick);
}

function Message() {

}

document.addEventListener("mousedown", function(e) {
    player.Dst.fromEvent(e);
    network.send("set-dst", player.Dst.json());
})
