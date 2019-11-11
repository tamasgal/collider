// Groooo!
//
// A simple "eating stuff" game.
//
// Author: Tamás Gál - https://github.com/tamasgal/groooo
//

var canvas;
var ctx;

var C = {
    "button": rgba(0, 0.5, 0.7, 1.0, offset=150),
    "button_clicked": "red",
    "button_text": "#333",
    "upgrade_button_active": rgba(0, 0.8, 0, 1.0, offset=150),
    "upgrade_button_inactive": rgba(0.8, 0, 0, 1.0, offset=150),
    "currency": "\u{1F789}",
}

var G = {
    "n_balls": 16,
    "world": {"width": 600, "height": 400},
    "balls": [],
    "targets": [],

    "mouse": {"x": 0, "y": 0},

    "points": 0,
    "points_": 0,
    "multiplier": 1.1,
    "lifetime": 100,
    "targetSize": 20,
    "magnet": {"x": 0, "y": 0, "factor": 0},
    "timewarp": 0,
    "timewarpFactor": 2,
    "timewarpFuel": 0,
    "isTimewarping": false,

    "inMenu": true,
    "inGame": false,
    "targetSet": false,

    "buttons": [],

    "longestChain": 0,
    "longestChainInRound": 0,

    "upgradeFactor": 1,
}

var KEY = {
    "shift": 16,
    "ctrl": 17,
    "alt": 18,
    "space": 32,
}

var egg = [];

window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.addEventListener("mousedown", startDrag);
    canvas.addEventListener("mousemove", mouseMoved);
    canvas.addEventListener("mouseup", stopDrag);
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    canvas.addEventListener("click", mouseClicked);

    initialise();

    var fps = 60.;
    setInterval(update, 1000/fps);

}

function initialise() {
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    initGUI();
    // initMusic();
}

// function initMusic() {
//     music = new Audio('music/Havevo.wav');
//     music.addEventListener('ended', function() {
//         this.currentTime = 0;
//         this.play();
//     }, false);
//     music.volume = 0.5;
//     music.play();
// }

function initGUI() {
    G.buttons.push(new Button("NEW ROUND", 50, 50, 100, 20, clickNewRound));
    G.buttons.push(
        new UpgradeButton("MULTIPLIER", 50, 100, 220, 20,
            displayValue = function() {
                return G.multiplier.toPrecision(2);
            },
            upgrade = function() {
                G.multiplier += .1;
            },
            upgradeCost = function(level) {
                return Math.pow(2, level);
            }
        )
    );
    G.buttons.push(
        new UpgradeButton("BALLS", 50, 125, 220, 20,
            displayValue = function() {
                return G.n_balls;
            },
            upgrade = function() {
                G.n_balls += 1;
            },
            upgradeCost = function(level) {
                return Math.pow(4, level);
            }
        )
    );
    G.buttons.push(
        new UpgradeButton("TARGET SIZE", 50, 150, 220, 20,
            displayValue = function() {
                return G.targetSize;
            },
            upgrade = function() {
                G.targetSize += 1;
            },
            upgradeCost = function(level) {
                return Math.pow(3, level);
            }
        )
    );
    G.buttons.push(
        new UpgradeButton("LIFETIME", 50, 175, 220, 20,
            displayValue = function() {
                return G.lifetime;
            },
            upgrade = function() {
                G.lifetime += 10;
            },
            upgradeCost = function(level) {
                return Math.pow(3, level);
            }
        )
    );
    G.buttons.push(
        new UpgradeButton("MAGNET", 50, 200, 220, 20,
            displayValue = function() {
                return G.magnet.factor;
            },
            upgrade = function() {
                G.magnet.factor += 1;
            },
            upgradeCost = function(level) {
                return Math.pow(10, level + 1);
            }
        )
    );
    G.buttons.push(
        new UpgradeButton("TIMEWARP", 50, 225, 220, 20,
            displayValue = function() {
                return G.timewarp;
            },
            upgrade = function() {
                G.timewarp += 10;
            },
            upgradeCost = function(level) {
                return Math.pow(10, level + 1);
            }
        )
    );
    G.buttons.push(
        new UpgradeButton("TIMEWARP FACTOR", 50, 250, 220, 20,
            displayValue = function() {
                return G.timewarpFactor;
            },
            upgrade = function() {
                G.timewarpFactor += 1;
            },
            upgradeCost = function(level) {
                return Math.pow(10, level + 1);
            }
        )
    );
}

function startNewRound() {
    G.balls = [];
    G.targets = [];
    G.longestChainInRound = 0,
    G.timewarpFuel = G.timewarp,
    createBalls();
}

function createBalls()  {
    var x, y, r, v;
    for(i=0; i<G.n_balls; i++) {
        r = 5;
        x = (G.world.width - 2 * r) * Math.random() + r;
        y = (G.world.height - 2 * r) * Math.random() + r;
        d = Math.random() * Math.PI;
        v = Math.random() * 3 + 1;
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
    ctx.fillStyle = rgba(0.1, 0.05, 0, 1.0, offset=180);
    ctx.strokeStyle = 'white';
    ctx.fillRect(0, 0, G.world.width, G.world.height);

    for(i=G.buttons.length-1; i>=0; i--) {
        var button = G.buttons[i];
        button.draw();
        if(isInside(G.mouse.x, G.mouse.y, button)) {
            button.hover(G.mouse.x, G.mouse.y);
        }
    }
}

function drawStats() {
    ctx.lineWidth = '5';
    ctx.fillStyle = rgba(0.8, 0.8, 0.83, 1.0);
    ctx.strokeStyle = 'white';

    var x0 = 0;
    var y0 = G.world.height - 30;

    if(G.points != G.points_) {
        if(Math.abs(G.points - G.points_) < 10) {
            G.points_ = G.points;
        } else {
            G.points_ += Math.round((G.points - G.points_) / 2);
        }
    }
    // ctx.fillRect(x0, y0, G.world.width, 1);
    ctx.font = "bold 12px Courier";
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = "#222";
    ctx.fillText(C.currency + ' '+ Math.round(G.points_), x0 + 10, y0);
    ctx.fillStyle = "#555";
    ctx.fillText("LONGEST CHAIN " + G.longestChain, x0 + 10, y0 + 12);
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
    timewarp();
    drawBalls();
    drawTargets();
    drawOverlay();
    processCollisions();
    updateMagnet();
    cleanUp();
    if(checkIfRoundHasEnded()) {
        G.inGame = false;
        G.inMenu = true;
        G.targetSet = false;
    }
}

function drawOverlay() {
    if(G.timewarp > 0) {
        ctx.fillStyle = "#000";
        var width = 100;
        var height = 5;
        var timewarpProgress = G.timewarpFuel / G.timewarp;
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(200, 200, 200, 0.9)';
        ctx.fillRect(G.world.width-10-100, G.world.height-15, width * timewarpProgress, height);
        ctx.strokeRect(G.world.width-10-100, G.world.height-15, width, height);
    }
}

function updateMagnet() {
    if(G.magnet.factor == 0 || G.targets.length == 0) {
        return;
    }
    var index = 0;
    var highestLifetime = 0;
    for(i=G.targets.length-1; i>=0; i--) {
        var target = G.targets[i];
        if(target.chain == G.longestChainInRound) {
            if(target.lifetime > highestLifetime) {
                index = i;
                highestLifetime = target.lifetime;
            }
        }
    }
    G.magnet.x = G.targets[index].x;
    G.magnet.y = G.targets[index].y;
}

function updateMenu() {
    drawMenu();
}

function updateStats() {
    drawStats();
}

function checkIfRoundHasEnded() {
    if(G.targetSet && (G.targets.length == 0 || G.balls.length == 0)) {
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
    var chain;
    for(i=G.balls.length-1; i>=0; i--) {
        var ball = G.balls[i];
        for(j=G.targets.length-1; j>=0; j--) {
            var target = G.targets[j];
            d = distance(ball, target);
            if(d < ball.r + target.r) {
                chain = target.chain + 1
                if(chain > G.longestChain) {
                    G.longestChain = chain;
                }
                if(chain > G.longestChainInRound) {
                    G.longestChainInRound = chain;
                }
                new_target = new Target(
                    ball.x,
                    ball.y,
                    chain
                );
                G.targets.push(new_target);
                points = Math.pow(G.multiplier, target.chain);

                addPoints(points);
                G.balls.splice(i, 1);
                return;
            }
        }
    }
}

function addPoints(p) {
    G.points += Math.ceil(p);
}

function distance(thing1, thing2) {
    return Math.sqrt(Math.pow(thing1.x - thing2.x, 2) + Math.pow(thing1.y - thing2.y, 2));
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
    if(!G.inMenu) {
        return;
    }
    G.mouse.x = evt.clientX - canvas.offsetLeft;
    G.mouse.y = evt.clientY - canvas.offsetTop;
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
    x = evt.clientX - canvas.offsetLeft;
    y = evt.clientY - canvas.offsetTop;
    for(i=G.buttons.length-1; i>=0; i--) {
        var button = G.buttons[i];
        if(isInside(x, y, button)) {
            button.click();
        }
    }
}

function clickNewRound() {
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
        target = new Target(x, y);
        G.targets.push(target);
        G.magnet.x = x;
        G.magnet.y = y;
    }
}

function check3DEllipsoid()
{
    while(egg.length > 13)
    {
        egg.shift();
    }
    if(egg.length == 13)
    {
        flag = true;
        cmp = [77,89,78,65,77,69,73,83,84,65,77,65,83];
        for(i=0; i < 13; i++)
        {
            if(cmp[i] != egg[i])
            {
                flag = flag & false;
            }
        }
        if(flag)
        {
            G.multiplier = 1000;
        }
    }
}

function keyDown(evt) {
    var k = evt.keyCode;
    if(k == KEY.shift) {
        G.upgradeFactor = 10;
    }
    if(k == KEY.ctrl) {
        G.upgradeFactor = "MAX";
    }
    if(k == KEY.space) {
        G.isTimewarping = true;
    }
    egg.push(k);
    check3DEllipsoid();
}

function timewarp() {
    if(G.isTimewarping && G.timewarpFuel >= 1) {
        G.timewarpFuel -= 1;
    } else {
        G.isTimewarping = false;
    }
}

function keyUp(evt) {
    var k = evt.keyCode;
    if(k == KEY.shift || k == KEY.ctrl) {
        G.upgradeFactor = 1;
    }
    if(k == KEY.space) {
        G.isTimewarping = false;
    }
}
