var canvas = document.createElement("canvas");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
document.body.appendChild(canvas);

var ctx = canvas.getContext("2d");
var FONT_SIZE = 13;
ctx.font = FONT_SIZE + "px Monospace";

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

function Character() {
    this.Pos = new Point;
    this.Dst = new Point;
    this.Angle = 0;
    this.Speed = 0;
    this.Name = "";
    this.img.src = "assets/player.png";
    this.init();
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
    img: new Image(),
    init: function() {
        //see 3d.js
    },
    draw: function() {
        if (!this.img.width)
            return

        var w = this.img.width, h = this.img.height;
        ctx.drawImage(this.img, (this.x - w / 2) << 0, (this.y - h / 2) << 0);

        this.drawName();
    },
    drawName: function() {
        var pad = 2;
        var w = ctx.measureText(this.Name).width;
        var x = this.x - w / 2;
        var y = this.y - this.img.height / 2 - 3 * pad;

        ctx.fillStyle = "#333";
        ctx.fillRect(x - pad, y - FONT_SIZE, w + 2 * pad, FONT_SIZE + 2 * pad)

        ctx.fillStyle = (this == player) ? "lightgreen" : "red";
        ctx.fillText(this.Name, x, y);
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
    sync: function(data) {
        copy(this, data);
        this.syncHook();
    },
    syncHook: function() {

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

        characters[name].sync(record);
    }
}

function Map() {
    this.width = canvas.width;
    this.height = canvas.height;
    this.draw = function() {
        ctx.clearRect(0, 0, this.width, this.height);
    }
}

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
var map = new Map;
