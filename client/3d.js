canvas.parentNode.removeChild(canvas);
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 0.1, 100);

function printMat4(m) {
    for (var i = 0; i < 4; i++) {
        var row = [];
        for (var j = 0; j < 4; j++) {
            row.push(m.elements[i * 4 + j]);
        }
        console.log(row);
    }
}

camera.position.x = 0;
camera.position.y = 20;
camera.position.z = 0;


camera.rotation.order = 'YXZ';

camera.Move = new THREE.Vector3();
camera.lookAt(new THREE.Vector3(0, 0, 0));

var renderer = new THREE.WebGLRenderer();

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onresize = resize;
resize();
document.body.appendChild(renderer.domElement);

var size = 10;
var step = 1;
var gridHelper = new THREE.GridHelper( size, step );
scene.add( gridHelper );

var axisHelper = new THREE.AxisHelper( 10 );
scene.add( axisHelper );

// var light = new THREE.AmbientLight( 0xffffff );
// scene.add( light );

function createDirectionLight(color, pos) {
    var directionalLight = new THREE.DirectionalLight( color, 0.5 );
    directionalLight.position.copy(pos);
    scene.add( directionalLight );
    var directionalLightSphere = new THREE.Mesh(
        new THREE.SphereGeometry( 0.5, 32, 32 ),
        new THREE.MeshBasicMaterial({color: color})
    );
    directionalLightSphere.position.copy(pos);
    scene.add(directionalLightSphere);
}
createDirectionLight(0xffffff, new THREE.Vector3(3, 2, 5 ));
// createDirectionLight(0xff0000, new THREE.Vector3( 5, 2, 3 ));

var mouse = new THREE.Vector2(Infinity, Infinity);
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();

document.addEventListener( 'mousemove', onDocumentMouseMove, false );

var rotating = false;
function onDocumentMouseMove( e ) {
    e.preventDefault();

    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    if (rotating) {
        var sens = 3e-3;
        var movementX = e.movementX ||
            e.mozMovementX          ||
            e.webkitMovementX       ||
            0,
        movementY = e.movementY ||
            e.mozMovementY      ||
            e.webkitMovementY   ||
            0;
        camera.rotation.y -= movementX * sens;
        camera.rotation.x -= movementY * sens;
    }
}

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

function moveCamera() {
    var speed = 0.1;
    if (camera.Move.z)
        camera.translateZ(speed * -camera.Move.z);

    if (camera.Move.x)
        camera.translateX(speed * -camera.Move.x);
}

document.addEventListener('keyup', function(e) {
    switch(e.keyCode) {
    case 87: //w
        if (camera.Move.z > 0)
            camera.Move.z = 0;
        break;
    case 83: //s
        if (camera.Move.z < 0)
            camera.Move.z = 0;
        break;
        break;
    case 65: //a
        if (camera.Move.x > 0)
            camera.Move.x = 0;
        break;
    case 68: //d
        if (camera.Move.x < 0)
            camera.Move.x = 0;
        break;
    }
});
document.addEventListener('keydown', function(e) {
    switch(e.keyCode) {
    case 87: //w
        camera.Move.z = 1;
        break;
    case 83: //s
        camera.Move.z = -1;
        break;
    case 65: //a
        camera.Move.x = 1;
        break;
    case 68: //d
        camera.Move.x = -1;
        break;
    }

});

document.body.requestPointerLock = document.body.requestPointerLock ||
    document.body.mozRequestPointerLock ||
    document.body.webkitRequestPointerLock;
document.exitPointerLock = document.exitPointerLock ||
    document.mozExitPointerLock ||
    document.webkitExitPointerLock;

document.addEventListener('mouseup', function(e) {
    rotating = false;
    document.exitPointerLock();
})


var plane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshPhongMaterial({
        ambient: 0x030303,
        color: 0x999999,
        specular: 0x009900,
        shininess: 30
    })
);

plane.rotation.x = -Math.PI / 2;
scene.add(plane);

var SCALE = 100;
document.addEventListener('mousedown', function(e) {
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    if (e.button == 2) { //right
        rotating = true;
        document.body.requestPointerLock();
        return;
    }
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1);
    projector.unprojectVector( vector, camera );
    raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

    var intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
        player.cube.destination = intersects[0].point;
        player.cube.destination.y = player.cube.position.y;
        player.Dst.X = (player.cube.destination.x + 10) * SCALE;
        player.Dst.Y = (player.cube.destination.z + 10) * SCALE;
        network.send("set-dst", player.Dst.json());
    }
})

function updateHook() {
    moveCamera();
}

function drawHook() {
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

    var intersects = raycaster.intersectObjects( scene.children );
    var intersected = false;
    for (var i = 0, l = intersects.length; i < l; i++) {
        var obj = intersects[i].object
        if (obj == player.cube) {
            intersected = true;
            player.cube.material.color.setHex(0xff0000);
        }
    }

    if (!intersected)
        player.cube.material.color.setHex(0x00cc00);

    renderer.render(scene, camera);
}

Character.prototype.init = function() {
    var cubeSize = 1;
    var geometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
    var material =  new THREE.MeshPhongMaterial({
        ambient: 0x030303,
        color: 0x33dd33,
        specular: 0x009900,
        shininess: 30
    });

    var cube = new THREE.Mesh(geometry, material);
    cube.position.x = -9;
    cube.position.z = -9;
    cube.position.y += cubeSize / 2;
    cube.destination = cube.position.clone();

    this.cube = cube;
    scene.add(cube);
}
Character.prototype.draw = function() {

}

Character.prototype.syncHook = function() {
    this.cube.position.x = this.Pos.X / SCALE - 10;
    this.cube.position.z = this.Pos.Y / SCALE - 10;
}

Character.prototype.update = function() {
    this.cube.destination.x = this.Dst.X / SCALE - 10;
    this.cube.destination.z = this.Dst.Y / SCALE - 10;

    var speed = (this.Speed / SCALE) * fps.k;
    if (this.cube.position.distanceTo(this.cube.destination) < speed) {
        this.cube.position.copy(this.cube.destination);
        return;
    }
    var v = this.cube.position.clone()
        .sub(this.cube.destination)
        .normalize()
        .multiplyScalar(speed);
    this.cube.position.sub(v);

}

function mouseDownHook(e) {

}
