var textarea = document.createElement("textarea");
textarea.style.width = document.body.width
textarea.style.height = document.body.height;
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
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

function print(msg) {
    textarea.value += msg + "\n";
}

function update() {
    fps.update();

    if (window.updateHook)
        updateHook();

    mapMethod(characters, "update");
}

function draw() {
    if (window.drawHook)
        drawHook()
    else
        map.draw();
    mapMethod(characters, "draw");
}

function tick() {
    stats.begin();
    requestAnimationFrame(tick);
    update();
    draw();
    stats.end();
}

function Message() {

}

document.addEventListener("mousedown", function(e) {
    if (window.mouseDownHook)
        return mouseDownHook(e);
    player.Dst.fromEvent(e);
    network.send("set-dst", player.Dst.json());
})
