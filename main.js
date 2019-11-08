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
var targets = [];
var targetSize = 20;

var roundStarted = false;


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
}

function startNewRound() {
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
    }
}

function drawCanvas() {
    ctx.lineWidth = '5';
    ctx.fillStyle = '#f2eded';
    ctx.strokeStyle = 'white';

    ctx.fillRect(0, 0, world.width, world.height);
}

function drawMenu() {
    ctx.lineWidth = '5';
    ctx.fillStyle = '#122389';
    ctx.strokeStyle = 'white';

    ctx.fillRect(0, 0, world.width, world.height);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function update() {
    tick();
    if(checkIfRoundHasEnded()) {
        updateMenu();
    } else {
        updateGame();
    }
}

function updateGame() {
    drawCanvas();
    drawBalls();
    drawTargets();
    processCollisions();
    cleanUp();
}

function updateMenu() {
    drawMenu();
}

function checkIfRoundHasEnded() {
    if(roundStarted && targets.length == 0) {
        return true;
    }
    return false;
}

function cleanUp() {
    var indices = [];
    for(i=targets.length-1; i>=0; i--) {
        var target = targets[i];
        if(target.lifetime <= 0) {
            indices.push(i);
        }
    }
    for(i=indices.length-1; i>=0; i--) {
        targets.splice(indices[i], 1);
    }
}

function tick() {
    for(i=balls.length-1; i>=0; i--) {
        var ball = balls[i];
        ball.tick();
    }
    for(i=targets.length-1; i>=0; i--) {
        var target = targets[i];
        target.tick();
    }
}

function processCollisions() {
    var d;
    for(i=balls.length-1; i>=0; i--) {
        var ball = balls[i];
        for(j=targets.length-1; j>=0; j--) {
            var target = targets[j];
            d = distance(ball, target);
            if(d < ball.r + target.r) {
                new_target = new Target(ball.x, ball.y, 20, '#000000');
                targets.push(new_target);
                balls.splice(i, 1);
                return;
            }
        }
    }
}

function distance(ball1, ball2) {
    return Math.sqrt(Math.pow(ball1.x - ball2.x, 2) + Math.pow(ball1.y - ball2.y, 2));
}

function drawBalls() {
    for(i=balls.length-1; i>=0; i--) {
        var ball = balls[i];
        ball.draw();
    }
}

function drawTargets() {
    for(i=targets.length-1; i>=0; i--) {
        var target = targets[i];
        target.draw();
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
    if( targets.length == 0 && !roundStarted)
    {
        clickInGame(evt);
    }
    clickInMenu(evt);
    return
}

function clickInMenu(evt) {
    console.log("New round started");
    roundStarted = true;
    startNewRound();
}

function clickInGame(evt) {
    roundStarted = true;
    x = evt.clientX - canvas.offsetLeft;
    y = evt.clientY - canvas.offsetTop;
    target = new Target(x, y, 20, '#000000');
    targets.push(target);
}
