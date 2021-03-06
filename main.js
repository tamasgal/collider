// Collider
//
// A simple "colliding" game.
//
// Authors: Tamás Gál - https://github.com/tamasgal/collider
//          Jonas Reubelt
//          Johannes Schumann

var canvas;
var ctx;

var C = {
    "button": rgba(0, 0.5, 0.7, 1.0, offset=150),
    "button_shadow": rgba(0, 0.1, 0.1, 1.0, offset=150),
    "button_shadow_highlighted": rgba(0, 0.1, 0.1, 1.0, offset=80),
    "button_clicked": "red",
    "button_text": "#333",
    "upgrade_button_active": rgba(0, 0.8, 0, 1.0, offset=150),
    "upgrade_button_inactive": rgba(0.8, 0, 0, 1.0, offset=150),
    "currency": "\u{25CF}",
}

var FLAVOR_COLORS = [
    rgba(1, 0, 0, 1.0),
    rgba(0, 0, 1, 1.0),
    rgba(0, 1, 0.5, 1.0),
    rgba(0.8, 0.6, 0, 1.0),
    rgba(0.23, 0.83, 0.78, 1.0)
];

var G = {
    "nRounds": 0,
    "nBalls": 16,
    "world": {"width": 800, "height": 600},
    "mouse": {"x": 0, "y": 0},

    "points": zeros(FLAVOR_COLORS.length),
    "points_": zeros(FLAVOR_COLORS.length),
    "multiplier": 1.1,
    "lifetime": 100,
    "targetSize": 20,
    "magnet": {"x": 0, "y": 0, "factor": 0},
    "timewarp": 0,
    "timewarpFactor": 2,
    "timewarpFuel": 0,
    "isTimewarping": false,

    "repulsionProb": 0,
    "maxHighlightTime": 100,

    "viscosity": 0,

    "inMenu": true,
    "inGame": false,
    "targetSet": false,

    "longestChain": 0,
    "longestChainInRound": 0,

    "upgradeFactor": 1,

    "upgrades": {},

    "ascension": 0,

    "currencyScaling": 1000,
}

// cost scaling
var CS = {
    "multiplier": 3,
    "nBalls": 5,
    "targetSize": 5,
    "lifetime": 5,
    "magnet": 100,
    "timewarp": 10,
    "timewarpFactor": 10,
    "repulsion": 5,
    "viscosity": 100,

}

//upgrade scaling
var US = {
    "multiplier": 0.1,
    "nBalls": 1,
    "targetSize": 1,
    "lifetime": 10,
    "magnet": 1,
    "timewarp": 10,
    "timewarpFactor": 1,
    "repulsion": .01,
    "viscosity": .001,

}

var S = {
    "balls": [],
    "targets": [],
    "scores": [],
    "roundPoints": zeros(FLAVOR_COLORS.length),
    "roundPoints_": zeros(FLAVOR_COLORS.length),
}

var GUI = {
    "buttons": [],
}

var KEY = {
    "shift": 16,
    "ctrl": 17,
    "alt": 18,
    "space": 32,
}

var egg = [];

if (typeof window !== 'undefined') {

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
        // setInterval(saveState, 1000);
    }
}

function zeros(n) {
    return Array.apply(null, Array(n)).map(Number.prototype.valueOf,0);
}

function totalPoints() {
    var p = 0;
    for(var i=0; i<G.points.length; i++) {
        p += G.points[i] * Math.pow(G.currencyScaling, i);
    }
    return p;
}

function restoreState() {
    var cookie_index = document.cookie.indexOf("G=");
    if(cookie_index != -1) {
        console.log("Restoring game state...");
        G = JSON.parse(getCookie('G'));
        console.log(G);
    }
}

function saveState() {
    console.log("Saving game state...");
    setCookie("G", JSON.stringify(G), 365);
    console.log(JSON.stringify(G));
}

function setCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}


function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

function eraseCookie(name) {
    document.cookie = name+'=; Max-Age=-99999999;';
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

function reset() {
    G = DEFAULT_G;
    eraseCookie("G");
}

U = {
    'MULTIPLIER': {
        'displayValue' : function() { return G.multiplier.toPrecision(3); },
        'upgrade' : function() { G.multiplier += US.multiplier; },
        'upgradeCost' : function(level) { return Math.pow(CS.multiplier, level); }
    },
    'BALLS': {
        'displayValue' : function() {return G.nBalls;},
        'upgrade' : function() {G.nBalls += US.nBalls;},
        'upgradeCost' : function(level) {return Math.pow(CS.nBalls, level);}
    },
    'TARGET SIZE': {
        'displayValue' : function() {return G.targetSize;},
        'upgrade' : function() {G.targetSize += US.targetSize;},
        'upgradeCost' : function(level) {return Math.pow(CS.targetSize, level);}
    },
    'LIFETIME': {
        'displayValue' : function() {return G.lifetime;},
        'upgrade' : function() {G.lifetime += US.lifetime;},
        'upgradeCost' : function(level) {return Math.pow(CS.lifetime, level);}
    },
    'MAGNET': {
        'displayValue' : function() {return G.magnet.factor;},
        'upgrade' : function() {G.magnet.factor += US.magnet;},
        'upgradeCost' : function(level) {return Math.pow(CS.magnet, level);}
    },
    'TIMEWARP': {
        'displayValue' : function() {return G.timewarp;},
        'upgrade' : function() {G.timewarp += US.timewarp;},
        'upgradeCost' : function(level) {return Math.pow(CS.timewarp, level);}
    },
    'TIMEWARP FACTOR': {
        'displayValue' : function() {return G.timewarpFactor;},
        'upgrade' : function() {G.timewarpFactor += US.timewarpFactor;},
        'upgradeCost' : function(level) {return Math.pow(CS.timewarpFactor, level);}
    },
    'REPULSION': {
        'displayValue' : function() {return G.repulsionProb.toPrecision(2);},
        'upgrade' : function() {G.repulsionProb += US.repulsion;},
        'upgradeCost' : function(level) {return Math.pow(CS.repulsion, level);}
    },
    'VISCOSITY': {
        'displayValue' : function() {return G.viscosity.toPrecision(2);},
        'upgrade' : function() {G.viscosity += US.viscosity;},
        'upgradeCost' : function(level) {return Math.pow(CS.viscosity, level);}
    }
}

function initGUI() {
    GUI.buttons.push(new Button("START ROUND", 50, 50, 180, 20, clickNewRound));
    GUI.buttons.push(new Button("RESTORE", G.world.width-50-100, 275, 100, 20, restoreState));
    GUI.buttons.push(new Button("SAVE", G.world.width-50-100, 300, 100, 20, saveState));

    let offset = 0;
    for(let key in U) {
        var upgrade = U[key];
        GUI.buttons.push(
            new UpgradeButton(key, 50, 100+offset, 180, 20,
                              upgrade.displayValue, upgrade.upgrade, upgrade.upgradeCost));
        console.log(key);
        offset += 25;
    }

}


function startNewRound() {
    G.nRounds += 1;
    S.balls = [];
    S.targets = [];
    S.scores = [];
    S.roundPoints = zeros(FLAVOR_COLORS.length),
    S.roundPoints_ = zeros(FLAVOR_COLORS.length),
    G.longestChainInRound = 0,
    G.timewarpFuel = G.timewarp,
    createBalls();
}

function createBalls()  {
    var x, y, r, v;
    for(i=0; i<G.nBalls; i++) {
        r = 5;
        x = (G.world.width - 2 * r) * Math.random() + r;
        y = (G.world.height - 2 * r) * Math.random() + r;
        d = Math.random() * 2 * Math.PI;
        v = Math.random() * 3 + 1;
        dx = Math.cos(d) * v;
        dy = Math.sin(d) * v;
        flavor = 0;
        for(j=1; j<=G.ascension; j++) {
            threshold = Math.pow((1 - j/(G.ascension + 1)), 2);
            if(Math.random() < threshold) {
                flavor = j;
            }
        }
        S.balls.push( new Ball(x, y, dx, dy, r, flavor) );
    }
}

function drawCanvas() {
    ctx.lineWidth = '5';
    ctx.fillStyle = '#f2eded';
    ctx.strokeStyle = 'white';
    ctx.fillRect(0, 0, G.world.width, G.world.height);
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, G.world.width, G.world.height);
}

function drawMenu() {
    ctx.lineWidth = '5';
    ctx.fillStyle = rgba(0.1, 0.05, 0, 1.0, offset=180);
    ctx.strokeStyle = '#999';
    ctx.fillRect(0, 0, G.world.width, G.world.height);
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, G.world.width, G.world.height);

    for(i=GUI.buttons.length-1; i>=0; i--) {
        var button = GUI.buttons[i];
        button.draw();
        if(isInside(G.mouse.x, G.mouse.y, button)) {
            button.hover(G.mouse.x, G.mouse.y);
            button.isHovered = true;
        } else {
            button.isHovered = false;
        }
    }
}

function drawStats() {
    ctx.lineWidth = '5';
    ctx.fillStyle = rgba(0.8, 0.8, 0.83, 1.0);
    ctx.strokeStyle = 'white';

    var x0 = 0;
    var y0 = G.world.height - 38;

    for(var i=FLAVOR_COLORS.length-1; i>=0; i--) {
        if(i > G.ascension) {
            continue;
        }
        color = FLAVOR_COLORS[i];
        p = S.roundPoints[i];
        p_ = S.roundPoints_[i];

        if(p != p_) {
            if(Math.abs(p - p_) < 10) {
                S.roundPoints_[i] = p;
            } else {
                S.roundPoints_[i] += Math.round((p - p_) / 2);
            }
        }
        // ctx.fillRect(x0, y0, G.world.width, 1);
        ctx.font = "bold 17px Courier";
        ctx.textBaseline = 'top';
        ctx.textAlign = 'right';
        ctx.fillStyle = color;
        ctx.fillText(Math.round(S.roundPoints_[i]) + ' ' + C.currency, G.world.width - 10, y0 - 17 * i);
    }

    for(var i=FLAVOR_COLORS.length-1; i>=0; i--) {
        if(i > G.ascension) {
            continue;
        }
        color = FLAVOR_COLORS[i];
        p = G.points[i];
        p_ = G.points_[i];

        if(p != p_) {
            if(Math.abs(p - p_) < 10) {
                G.points_[i] = p;
            } else {
                G.points_[i] += Math.round((p - p_) / 2);
            }
        }
        // ctx.fillRect(x0, y0, G.world.width, 1);
        ctx.font = "bold 17px Courier";
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillStyle = color;
        ctx.fillText(C.currency + ' '+ Math.round(G.points_[i]), x0 + 10, y0 - 17 * i);
    }
    ctx.font = "bold 12px Courier";
    ctx.fillStyle = "#555";
    ctx.fillText(
        "ROUND " + G.nRounds +
        ", LONGEST CHAIN " + G.longestChain + 
        " (" + G.longestChainInRound + ")",
        x0 + 10, y0 + 20
    );
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
        updateGUI();
        if(roundHasEnded()) {
            G.inGame = false;
            G.inMenu = true;
            G.targetSet = false;
        }
    }
    updateStats();
}

function updateGame() {
    tick();
    timewarp();
    processCollisions();
    updateMagnet();
    cleanUp();
}

function updateGUI() {
    drawCanvas();
    drawBalls();
    drawTargets();
    drawOverlay();
    drawScores();
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
    if(G.magnet.factor == 0 || S.targets.length == 0) {
        return;
    }
    var index = 0;
    var highestLifetime = 0;
    for(i=S.targets.length-1; i>=0; i--) {
        var target = S.targets[i];
        if(target.chain == G.longestChainInRound) {
            if(target.lifetime > highestLifetime) {
                index = i;
                highestLifetime = target.lifetime;
            }
        }
    }
    G.magnet.x = S.targets[index].x;
    G.magnet.y = S.targets[index].y;
}

function updateMenu() {
    drawMenu();
}

function updateStats() {
    drawStats();
}

function roundHasEnded() {
    if(G.targetSet && (S.targets.length == 0 || S.balls.length == 0)) {
        return true;
    }
    return false;
}

function cleanUp() {
    var indices = [];
    for(i=S.targets.length-1; i>=0; i--) {
        var target = S.targets[i];
        if(target.lifetime <= 0) {
            indices.push(i);
        }
    }
    for(i=indices.length-1; i>=0; i--) {
        S.targets.splice(indices[i], 1);
    }
    indices = [];
    for(i=S.scores.length-1; i>=0; i--) {
        var score = S.scores[i];
        if(score.lifetime <= 0) {
            indices.push(i);
        }
    }
    for(i=indices.length-1; i>=0; i--) {
        S.scores.splice(indices[i], 1);
    }
}

function tick() {
    for(i=S.balls.length-1; i>=0; i--) {
        var ball = S.balls[i];
        ball.tick();
    }
    for(i=S.targets.length-1; i>=0; i--) {
        var target = S.targets[i];
        target.tick();
    }
    for(i=S.scores.length-1; i>=0; i--) {
        var score = S.scores[i];
        score.tick();
    }
}

function processCollisions() {
    var d;
    var chain;
    for(i=S.balls.length-1; i>=0; i--) {
        var ball = S.balls[i];
        for(j=S.targets.length-1; j>=0; j--) {
            var target = S.targets[j];
            d = distance(ball, target);
            if(d < ball.r + target.r) {
                points = Math.ceil(Math.pow(G.multiplier, target.chain));
                addPointsXY(points, ball.x, ball.y, ball.flavor);
                S.roundPoints[ball.flavor] += points;

                if (Math.random() < G.repulsionProb){
                    target.lifetime = G.lifetime;
                    target.chain += 1;
                    v = new Point(ball.dx, ball.dy);
                    x1 = new Point(ball.x, ball.y);
                    x2 = new Point(target.x, target.y);
                    v_ = sub(v, scalarMult(2 * dot(v, sub(x1, x2)) / Math.pow(norm(sub(x1, x2)), 2), sub(x1, x2)));
                    ball.dx = v_.x;
                    ball.dy = v_.y;
                    ball.highlight_time = G.maxHighlightTime;
                    return;
                }
                // Collision
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
                S.targets.push(new_target);
                S.balls.splice(i, 1);
                return;
            }
        }
    }
}

function addPointsXY(points, x, y, flavor) {
    S.scores.push(new Score(x, y, points, flavor));
    G.points[flavor] += points;
}

function scalarMult(s, v){
    return new Point(s * v.x, s * v.y);
}

function dot(v1, v2){
    return v1.x * v2.x + v1.y * v2.y;
}

function sub(v1, v2){
    return new Point(v1.x - v2.x, v1.y - v2.y);
}

function norm(v) {
    return Math.sqrt(Math.pow(v.x, 2) +  Math.pow(v.y, 2));
}

function unit(v) {
    n = norm(v);
    return new Point(v.x / n, v.y / n);
}

// Use only with positive numbers!!!!!!!!! ahahahahah
function subtractPoints(p) {
    new_p = totalPoints() - p;
    for(var i=0; i<G.points.length; i++) {
        G.points[i] = Math.floor(new_p % Math.pow(G.currencyScaling, i + 1) / Math.pow(G.currencyScaling, i));
    }
}

function distance(thing1, thing2) {
    return Math.sqrt(Math.pow(thing1.x - thing2.x, 2) + Math.pow(thing1.y - thing2.y, 2));
}

function angle_between(v1, v2) {
    v1 = unit(v1);
    v2 = unit(v2);
    return Math.acos(v1.x * v2.x + v1.y * v2.y);
}

function drawBalls() {
    for(i=S.balls.length-1; i>=0; i--) {
        var ball = S.balls[i];
        if(G.magnet.factor > 0 && G.targetSet) {
            ctx.strokeStyle='rgba(255, 255, 255, 0.8)';

            ctx.beginPath();
            ctx.moveTo(ball.x, ball.y);
            ctx.quadraticCurveTo(ball.x + ball.dx * 20, ball.y + ball.dy * 20, G.magnet.x, G.magnet.y);
            // console.log(ball.x + ball.dx, ball.y + ball.dy, G.magnet.x, G.magnet.y);
            ctx.stroke();
        }
        ball.draw();
    }
}

function drawTargets() {
    for(i=S.targets.length-1; i>=0; i--) {
        var target = S.targets[i];
        target.draw();
    }
}

function drawScores() {
    for(i=S.scores.length-1; i>=0; i--) {
        var score = S.scores[i];
        score.draw();
    }
}

function startDrag(evt) {
    drag = true;
    if(1 == evt.which && G.inGame)
    {
        G.isTimewarping = true;
    }
}

function stopDrag(evt) {
    if(1 == evt.which && G.inGame)
    {
        G.isTimewarping = false;
        clickInGame(evt);
    }
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
    if(G.inMenu) {
        clickInMenu(evt);
    }
}

function clickInMenu(evt) {
    x = evt.clientX - canvas.offsetLeft;
    y = evt.clientY - canvas.offsetTop;
    for(i=GUI.buttons.length-1; i>=0; i--) {
        var button = GUI.buttons[i];
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
    if( S.targets.length == 0 && !G.targetSet) {
        x = evt.clientX - canvas.offsetLeft;
        y = evt.clientY - canvas.offsetTop;
        setTargetAt(x, y);
    }
}

function setTargetAt(x, y) {
    G.targetSet = true;
    target = new Target(x, y);
    S.targets.push(target);
    G.magnet.x = x;
    G.magnet.y = y;
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
