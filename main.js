// Groooo!
//
// A simple "eating stuff" game.
//
// Author: Tamás Gál - https://github.com/tamasgal/groooo
//

var canvas;
var n_balls = 32;
var ctx;
var world = {"width": 600, "height": 400};
var balls = [];
var gameOver = false;
var startTime = + new Date();
var endTime;
var zoom = 1;
var zooming = false;
var outro = false;

window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.addEventListener("mousedown", startDrag);
    canvas.addEventListener("mousemove", mouseMoved);
    canvas.addEventListener("mouseup", stopDrag);
    canvas.addEventListener("click", mouseClicked);

    initialise();

    var fps = 60.;
    setInterval(update, 1000/fps);

}

function initialise() {
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    createBalls();
}

function createBalls()  {
    var x, y, r, v;
    for(i=0; i<n_balls; i++) {
        r = 10;
        x = (world.width - 2 * r) * Math.random() + r;
        y = (world.height - 2 * r) * Math.random() + r;
        d = Math.random() * Math.PI;
        v = Math.random() * 5 + 1;
        dx = Math.cos(d) * v;
        dy = Math.sin(d) * v;
        balls.push( new Ball(x, y, dx, dy, r) );
        console.log(x, y);
    }
}

function drawCanvas() {
    ctx.lineWidth = '5';
    ctx.fillStyle = '#f2eded';
    ctx.strokeStyle = 'white';

    ctx.fillRect(0, 0, world.width, world.height);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function update() {
    tick();
    drawCanvas();
    drawBalls();
}

function tick() {
    for(i=balls.length-1; i>=0; i--) {
        var ball = balls[i];
        ball.tick();
    }
}

function drawBalls() {
    for(i=balls.length-1; i>=0; i--) {
        var ball = balls[i];
        ball.draw();
    }
}

function startDrag(evt) {
    drag = true;
}

function stopDrag(evt) {
    drag = false;
}

function mouseMoved(evt) {
    return;
    if(drag) {
        target.x = evt.offsetX - canvas.width/2 + pos.x;
        target.y = evt.offsetY - canvas.height/2 + pos.y;
        targetPointer.x = evt.offsetX;
        targetPointer.y = evt.offsetY;
        targetPointer.refresh();
    }
}

function mouseClicked(evt) {
    return;
    clicks += 1;
    
    target.x = evt.clientX - canvas.width/2 + pos.x;
    target.y = evt.clientY - canvas.height/2 + pos.y;

    var dir = new Point(target.x - pos.x, target.y - pos.y);
    var distance = Math.sqrt(Math.pow(dir.x, 2) + Math.pow(dir.y, 2));
    if(distance > 0) {
        avatar.dx += dir.x/distance;
        avatar.dy += dir.y/distance;
        avatar.r *= 0.993;
        thrust.dx = dir.x/distance;
        thrust.dy = dir.y/distance;
        thrust.refresh();
    }

    console.log(target);
    targetPointer.x = evt.clientX;
    targetPointer.y = evt.clientY;
    targetPointer.refresh();
}
