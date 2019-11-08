// Groooo!
//
// A simple "eating stuff" game.
//
// Author: Tamás Gál - https://github.com/tamasgal/groooo
//

var canvas;
var ctx;

var g = {
    "n_balls": 16,
    "world": {"width": 600, "height": 400},
    "balls": [],
    "targets": [],

    "points": 0,
    "points_": 0,
    "multiplier": 1.1,

    "inMenu": true,
    "inGame": false,
    "targetSet": false
}


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
    for(i=0; i<g.n_balls; i++) {
        r = 10;
        x = (g.world.width - 2 * r) * Math.random() + r;
        y = (g.world.height - 2 * r) * Math.random() + r;
        d = Math.random() * Math.PI;
        v = Math.random() * 5 + 1;
        dx = Math.cos(d) * v;
        dy = Math.sin(d) * v;
        g.balls.push( new Ball(x, y, dx, dy, r) );
    }
}

function drawCanvas() {
    ctx.lineWidth = '5';
    ctx.fillStyle = '#f2eded';
    ctx.strokeStyle = 'white';

    ctx.fillRect(0, 0, g.world.width, g.world.height);
}

function drawMenu() {
    ctx.lineWidth = '5';
    ctx.fillStyle = '#122389';
    ctx.strokeStyle = 'white';

    ctx.fillRect(0, 0, g.world.width, g.world.height);
}

function drawStats() {
    ctx.lineWidth = '5';
    ctx.fillStyle = '#000';
    ctx.strokeStyle = 'white';

    var x0 = 0;
    var y0 = g.world.height;

    if(g.points > g.points_) {
        g.points_ += Math.round((g.points - g.points_) / 2);
    }
    ctx.fillRect(x0, y0, g.world.width, 100);
    ctx.font = "bold 30px Courier";
    ctx.fillStyle = "#fff";
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillText("POINTS " + Math.round(g.points_), x0 + 20, y0 + 40);
    console.log(g.points);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function update() {
    if(g.inMenu) {
        updateMenu();
    }
    if(g.inGame) {
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
        g.inGame = false;
        g.inMenu = true;
        g.targetSet = false;
    }
}

function updateMenu() {
    drawMenu();
}

function updateStats() {
    drawStats();
}

function checkIfRoundHasEnded() {
    if(g.targetSet && g.targets.length == 0) {
        return true;
    }
    return false;
}

function cleanUp() {
    var indices = [];
    for(i=g.targets.length-1; i>=0; i--) {
        var target = g.targets[i];
        if(target.lifetime <= 0) {
            indices.push(i);
        }
    }
    for(i=indices.length-1; i>=0; i--) {
        g.targets.splice(indices[i], 1);
    }
}

function tick() {
    for(i=g.balls.length-1; i>=0; i--) {
        var ball = g.balls[i];
        ball.tick();
    }
    for(i=g.targets.length-1; i>=0; i--) {
        var target = g.targets[i];
        target.tick();
    }
}

function processCollisions() {
    var d;
    var generation;
    for(i=g.balls.length-1; i>=0; i--) {
        var ball = g.balls[i];
        for(j=g.targets.length-1; j>=0; j--) {
            var target = g.targets[j];
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
                g.targets.push(new_target);
                addPoints(Math.pow(g.multiplier, target.generation));
                g.balls.splice(i, 1);
                return;
            }
        }
    }
}

function addPoints(p) {
    g.points += p;
}

function distance(ball1, ball2) {
    return Math.sqrt(Math.pow(ball1.x - ball2.x, 2) + Math.pow(ball1.y - ball2.y, 2));
}

function drawBalls() {
    for(i=g.balls.length-1; i>=0; i--) {
        var ball = g.balls[i];
        ball.draw();
    }
}

function drawTargets() {
    for(i=g.targets.length-1; i>=0; i--) {
        var target = g.targets[i];
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
    if(g.inGame) {
        clickInGame(evt);
    }
    if(g.inMenu) {
        clickInMenu(evt);
    }
}

function clickInMenu(evt) {
    console.log("New round started");
    startNewRound();
    g.inGame = true;
    g.inMenu = false;
}

function clickInGame(evt) {
    console.log("Clicked in-game");
    if( g.targets.length == 0 && !g.targetSet) {
        g.targetSet = true;
        x = evt.clientX - canvas.offsetLeft;
        y = evt.clientY - canvas.offsetTop;
        target = new Target(x, y, 20, '#000000');
        g.targets.push(target);
    }
}
