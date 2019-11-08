// Groooo!
//
// A simple "eating stuff" game.
//
// Author: Tamás Gál - https://github.com/tamasgal/groooo
//

var canvas;
var ctx;

var G = {
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
    G.balls = [];
    createBalls();
}

function createBalls()  {
    var x, y, r, v;
    for(i=0; i<G.n_balls; i++) {
        r = 10;
        x = (G.world.width - 2 * r) * Math.random() + r;
        y = (G.world.height - 2 * r) * Math.random() + r;
        d = Math.random() * Math.PI;
        v = Math.random() * 5 + 1;
        dx = Math.cos(d) * v;
        dy = Math.sin(d) * v;
        G.balls.push( new Ball(x, y, dx, dy, r) );
    }
}

function drawCanvas() {
    ctx.lineWidth = '5';
    ctx.fillStyle = '#f2eded';
    ctx.strokeStyle = 'white';

    ctx.fillRect(0, 0, G.world.width, G.world.height);
}

function drawMenu() {
    ctx.lineWidth = '5';
    ctx.fillStyle = 'rgba(100, 100, 150, 1.0)';
    ctx.strokeStyle = 'white';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, G.world.width, G.world.height);
    ctx.globalAlpha = 1.0;
}

function drawStats() {
    ctx.lineWidth = '5';
    ctx.fillStyle = '#000';
    ctx.strokeStyle = 'white';

    var x0 = 0;
    var y0 = G.world.height;

    if(G.points > G.points_) {
        G.points_ += Math.round((G.points - G.points_) / 2);
    }
    ctx.fillRect(x0, y0, G.world.width, 100);
    ctx.font = "bold 30px Courier";
    ctx.fillStyle = "#fff";
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.fillText("POINTS " + Math.round(G.points_), x0 + 20, y0 + 40);
    console.log(G.points);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function update() {
    if(G.inMenu) {
        updateMenu();
    }
    if(G.inGame) {
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
        G.inGame = false;
        G.inMenu = true;
        G.targetSet = false;
    }
}

function updateMenu() {
    drawMenu();
}

function updateStats() {
    drawStats();
}

function checkIfRoundHasEnded() {
    if(G.targetSet && G.targets.length == 0) {
        return true;
    }
    return false;
}

function cleanUp() {
    var indices = [];
    for(i=G.targets.length-1; i>=0; i--) {
        var target = G.targets[i];
        if(target.lifetime <= 0) {
            indices.push(i);
        }
    }
    for(i=indices.length-1; i>=0; i--) {
        G.targets.splice(indices[i], 1);
    }
}

function tick() {
    for(i=G.balls.length-1; i>=0; i--) {
        var ball = G.balls[i];
        ball.tick();
    }
    for(i=G.targets.length-1; i>=0; i--) {
        var target = G.targets[i];
        target.tick();
    }
}

function processCollisions() {
    var d;
    var generation;
    for(i=G.balls.length-1; i>=0; i--) {
        var ball = G.balls[i];
        for(j=G.targets.length-1; j>=0; j--) {
            var target = G.targets[j];
            d = distance(ball, target);
            if(d < ball.r + target.r) {
                generation = target.generation + 1
                new_target = new Target(
                    ball.x,
                    ball.y,
                    20,
                    '#000000',
                    1000,
                    generation
                );
                console.log(new_target.generation);
                G.targets.push(new_target);
                points = Math.pow(G.multiplier, target.generation);

                addPoints(points);
                G.balls.splice(i, 1);
                return;
            }
        }
    }
}

function addPoints(p) {
    G.points += p;
}

function distance(ball1, ball2) {
    return Math.sqrt(Math.pow(ball1.x - ball2.x, 2) + Math.pow(ball1.y - ball2.y, 2));
}

function drawBalls() {
    for(i=G.balls.length-1; i>=0; i--) {
        var ball = G.balls[i];
        ball.draw();
    }
}

function drawTargets() {
    for(i=G.targets.length-1; i>=0; i--) {
        var target = G.targets[i];
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
    if(G.inGame) {
        clickInGame(evt);
    }
    if(G.inMenu) {
        clickInMenu(evt);
    }
}

function clickInMenu(evt) {
    console.log("New round started");
    startNewRound();
    G.inGame = true;
    G.inMenu = false;
}

function clickInGame(evt) {
    console.log("Clicked in-game");
    if( G.targets.length == 0 && !G.targetSet) {
        G.targetSet = true;
        x = evt.clientX - canvas.offsetLeft;
        y = evt.clientY - canvas.offsetTop;
        target = new Target(x, y, 20, '#000000');
        G.targets.push(target);
    }
}
