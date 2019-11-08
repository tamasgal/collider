// Groooo!
//
// A simple "eating stuff" game.
//
// Author: Tamás Gál - https://github.com/tamasgal/groooo
//

var canvas;
var n_balls = 16;
var ctx;
var world = {"width": 600, "height": 400};
var balls = [];
var gameOver = false;
var targets = [];
var targetSize = 20;

var points = 0;
var multiplier = 1.1;

var inMenu = true;
var inGame = false;
var targetSet = false;


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

function drawStats() {
    ctx.lineWidth = '5';
    ctx.fillStyle = '#000';
    ctx.strokeStyle = 'white';

    var x0 = 0;
    var y0 = world.height;

    ctx.fillRect(x0, y0, world.width, 100);
    ctx.font = "bold 30px Courier";
    ctx.fillStyle = "#fff";
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillText("POINTS " + Math.round(points), x0 + 20, y0 + 40);
    console.log(points);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function update() {
    if(inMenu) {
        updateMenu();
    }
    if(inGame) {
        updateGame();
    }
    updateStats();
}

function updateGame() {
    tick();
    drawCanvas();
    drawBalls();
    drawTargets();
    processCollisions();
    cleanUp();
    if(checkIfRoundHasEnded()) {
        inGame = false;
        inMenu = true;
        targetSet = false;
    }
}

function updateMenu() {
    drawMenu();
}

function updateStats() {
    drawStats();
}

function checkIfRoundHasEnded() {
    if(targetSet && targets.length == 0) {
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
    var generation;
    for(i=balls.length-1; i>=0; i--) {
        var ball = balls[i];
        for(j=targets.length-1; j>=0; j--) {
            var target = targets[j];
            d = distance(ball, target);
            if(d < ball.r + target.r) {
                generation = target.generation + 1
                new_target = new Target(
                    ball.x,
                    ball.y,
                    20,
                    '#000000',
                    100,
                    generation
                );
                console.log(new_target.generation);
                targets.push(new_target);
                points += Math.pow(multiplier, target.generation)
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
    if(inGame) {
        clickInGame(evt);
    }
    if(inMenu) {
        clickInMenu(evt);
    }
}

function clickInMenu(evt) {
    console.log("New round started");
    startNewRound();
    inGame = true;
    inMenu = false;
}

function clickInGame(evt) {
    console.log("Clicked in-game");
    if( targets.length == 0 && !targetSet) {
        targetSet = true;
        x = evt.clientX - canvas.offsetLeft;
        y = evt.clientY - canvas.offsetTop;
        target = new Target(x, y, 20, '#000000');
        targets.push(target);
    }
}
