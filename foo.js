// create an rgba string to be used in ctx.*
// r, g, b and a should be values in (0, 1)
// the offset is a number between 0 and 255 and defines the "pastelity"
function rgba(r, g, b, a, offset=100) {
    s = 255 - offset;
    r = offset + Math.round(r * s);
    g = offset + Math.round(g * s);
    b = offset + Math.round(b * s);
    return 'rgba('+r+','+g+','+b+','+a+')';
}
function isInside(x, y, rect){
    return x > rect.x && x < rect.x+rect.width && y < rect.y+rect.height && y > rect.y
}

var Button = function(text, x, y, width, height, callback) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.callback = callback;
    this.isHovered = false;

    this.draw = function() {
        if(this.isHovered) {
            ctx.fillStyle = C.button_shadow_highlighted;
        } else {
            ctx.fillStyle = C.button_shadow;
        }
        ctx.fillRect(this.x+2, this.y+2, this.width, this.height);
        ctx.fillStyle = C.button;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = C.button_text;
        ctx.font = "bold 15px Courier";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + Math.round(this.height / 2) + 1);
    }

    this.click = function() {
        this.callback();
    }

    this.hover = function() {}
}

// A button for upgrade. The `upgrade` is called when the button is clicked
// and the upgrade is affordable. The cost is automatically subtracted from
// the points, so `upgrade` only has to implement the actual effect.
// The `upgradeCost(level)` function returns the cost of the upgrade for
// the given level.
var UpgradeButton = function(text, x, y, width, height, displayValue, upgrade, upgradeCost) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.upgrade = upgrade;
    this.displayValue = displayValue;
    this.upgradeCost = upgradeCost;
    this.upgradeProgress = 0.0;
    this.isHovered = false;
    this.hidden = true;
    this.flavor = 0;

    this.getLevel = function() {
        if(G["upgrades"][this.text] === undefined) {
            G["upgrades"][this.text] = 0;
        }
        return G["upgrades"][this.text];
    }

    this.setLevel = function(level) {
        G["upgrades"][this.text] = level;
    }
    this.setLevel(0);

    this.increaseLevel = function(level) {
        this.setLevel(this.getLevel() + level);
    }

    this.draw = function() {
        if(this.hidden) {
            if(totalPoints() >= this.nextUpgrade()) {
                this.hidden = false;
            } else {
                return;
            }
        }
        if(this.isHovered) {
            ctx.fillStyle = C.button_shadow_highlighted;
        } else {
            ctx.fillStyle = C.button_shadow;
        }
        ctx.fillRect(this.x+2, this.y+2, this.width, this.height);
        if(totalPoints() >= this.nextUpgrade()) {
            ctx.fillStyle = C.upgrade_button_active;
        } else {
            ctx.fillStyle = C.upgrade_button_inactive;
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#fff';
        this.adjustUpgradeProgress();
        ctx.fillRect(this.x, this.y + this.height-2, this.upgradeProgress * this.width, 2);

        // Flavor indicator
        ctx.fillStyle = FLAVOR_COLORS[Math.floor(Math.log10(this.nextUpgrade()) / Math.log10(G.currencyScaling))];
        ctx.fillRect(this.x, this.y, 5, this.height);

        ctx.fillStyle = C.button_text;
        ctx.font = "bold 13px Courier";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        var suffix = '';
        if(G.upgradeFactor != 1) {
            if(G.upgradeFactor == "MAX") {
                suffix = " + " + this.highestPossibleUpgrade();
            } else {
                suffix = " + " + G.upgradeFactor;
            }
        }
        ctx.fillText(this.text, this.x + 10, this.y + Math.round(this.height / 2));
        ctx.textAlign = 'right';
        ctx.fillText(this.displayValue(), this.x + this.width - 5, this.y + Math.round(this.height / 2));
        ctx.textAlign = 'left';
        ctx.fillText("LVL " + this.getLevel() + suffix, this.x + this.width + 5, this.y + Math.round(this.height / 2));
    }

    this.click = function() {
        var factor = G.upgradeFactor;
        if(factor == "MAX") {
            factor = this.highestPossibleUpgrade();
        }
        for(var i=0; i<factor; i++) {
            var cost = this.upgradeCost(this.getLevel() + 1);
            if(totalPoints() >= cost) {
                subtractPoints(cost);
                this.increaseLevel(1);
                this.upgrade();
            }
        }
    }
    this.hover = function(x, y) {
        if(this.hidden) {
            return;
        }
        ctx.fillStyle = '#fff';
        ctx.font = "bold 10px Courier";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(C.currency + ' ' + this.nextUpgrade(), x+10, y);
    }

    this.nextUpgrade = function() {
        var factor = G.upgradeFactor;
        if(G.upgradeFactor == "MAX") {
            factor = this.highestPossibleUpgrade();
            if(factor == 0) {
                factor = 1;
            }
        }
        if(factor == 1) {
            return this.upgradeCost(this.getLevel() + 1);
        } else {
            var total = 0;
            for(var i=1; i<=factor; i++) {
                total += this.upgradeCost(this.getLevel() + i);
            }
            return total;
        }
    }

    this.highestPossibleUpgrade = function() {
        var factor = 0;
        var points = totalPoints();
        for(var i=1; true; i++) {
            points -= this.upgradeCost(this.getLevel() + i); 
            if(points >= 0) {
                factor += 1;
            } else {
                break;
            }
        }
        return factor;
    }

    this.adjustUpgradeProgress = function() {
        var cost = this.nextUpgrade();
        var progress = totalPoints() / cost;
        if(totalPoints() >= cost) {
            progress = 1.0;
        }
        this.upgradeProgress += (progress - this.upgradeProgress) / 2;
    }
}
var Point = function(x, y) {
    this.x = x;
    this.y = y;
}

var Ball = function(x, y, dx, dy, r, flavor) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.r = r;
    this.flavor = flavor;
    this.highlight_time = 0;

    this.tick = function() {
        if (this.x + this.dx > G.world.width - this.r || this.x + this.dx < this.r) {
            this.dx = -this.dx;
        }
        if (this.y + this.dy > G.world.height - this.r || this.y + this.dy < this.r) {
            this.dy = -this.dy;
        }
        if(G.magnet.factor > 0 && S.targets.length > 0) {
            dist = distance(G.magnet, this);
            mdx = (G.magnet.x - this.x) / dist * G.magnet.factor / 100;
            mdy = (G.magnet.y - this.y) / dist * G.magnet.factor / 100;
            this.dx += mdx;
            this.dy += mdy;
        }
        if(G.viscosity > 0) {
            this.dx /= (1 + G.viscosity);
            this.dy /= (1 + G.viscosity);
        }
        dx = this.dx;
        dy = this.dy;
        if(G.isTimewarping) {
            dx /= G.timewarpFactor;
            dy /= G.timewarpFactor;
        }

        if(this.highlight_time > 0) {
            this.highlight_time -= 1;
        }

        x = this.x + dx;
        y = this.y + dy;
        this.x = x;
        this.y = y;
    }

    this.draw = function() {
        ctx.beginPath();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = FLAVOR_COLORS[this.flavor];
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        if(this.highlight_time > 0) {
            ctx.fillStyle = rgba(0, 0, 1, this.highlight_time / G.maxHighlightTime);
            ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
            ctx.fill();
        }
    }
}


var Target = function(x, y, chain=1) {
    this.x = x;
    this.y = y;
    this.lifetime = G.lifetime;
    this.chain = chain;
    this.r = G.targetSize;

    this.tick = function() {
        if(G.isTimewarping) {
            this.lifetime -= (1 / G.timewarpFactor);
        } else {
            this.lifetime -= 1;
        }
    }

    this.draw = function() {
        var radius = this.r
        if(this.lifetime - G.lifetime > -10) {
            radius += (Math.cos(this.lifetime) * 2);
        } else {
            radius = G.targetSize;
        }
        var a = this.lifetime / G.lifetime;
        var r = this.chain / G.nBalls;
        var g = 0;
        var b = 1 - r;
        ctx.beginPath();
        ctx.fillStyle = rgba(r, g, b, a);
        ctx.arc(this.x, this.y, radius, 0, 2*Math.PI);
        ctx.fill();
        ctx.font = "bold 15px Courier";
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgb(255, 255, 255, ' + a + ')';
        ctx.fillText(this.chain, this.x, this.y);
    }
}


var Score = function(x, y, value, flavor) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.lifetime = 100;
    this.flavor = flavor;

    this.tick = function() {
        this.lifetime -= 1;
        this.y -= 2;
    }

    this.draw = function() {
        ctx.beginPath();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        a = Math.pow(this.lifetime / 100, 3);
        ctx.font = "bold " + (15 + Math.floor(a*40)) + "px Courier";
        ctx.globalAlpha = a;
        ctx.fillStyle = FLAVOR_COLORS[this.flavor];
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
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
    "multiplier": 1.1,
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
        'upgrade' : function() { G.multiplier *= US.multiplier; },
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
function testrun() {
    console.log("x y points n_ticks consumed_balls n_balls multiplier lifetime target_size magnet repulsion");
    //G.nBalls = 1000;
    //G.lifetime = 1000;
    //G.magnet.factor = 10;
    //G.targetSize = 100;
    var n_rounds = 5;
    var nBalls_start = G.nBalls;
    var multiplier_start = G.multiplier;
    var lifetime_start = G.lifetime;
    var targetSize_start = G.targetSize;
    var magnet_start = G.magnet.factor;
    var repulsion_start = G.repulsionProb;

    for (G.nBalls; G.nBalls < 100; G.nBalls+=5) {
      for (G.multiplier; G.multiplier < 20; G.multiplier*=1.1) {
        for (G.lifetime; G.lifetime < 250; G.lifetime+=20) {
          for (G.targetSize; G.targetSize < 100; G.targetSize+=5) {
            for (G.magnet.factor; G.magnet.factor < 20; G.magnet.factor+=1) {
              for (G.repulsionProb; G.repulsionProb < .7; G.repulsionProb+=0.05) {
                for (var i=0; i<n_rounds; i++){
                  startNewRound();

                  var x = Math.round(Math.random() * G.world.width);
                  var y = Math.round(Math.random() * G.world.height);

                  setTargetAt(x, y);

                  var n_ticks = 0;
                  while(!roundHasEnded()) {
                      updateGame();
                      n_ticks += 1;
                  }

                  console.log(x + " " + y + " " + G.points[0] + " " + n_ticks +
                              " " + (G.nBalls - S.balls.length) + " " + G.nBalls +
                              " " + G.multiplier + " " + G.lifetime + " " +
                              G.targetSize + " " + G.magnet.factor + " " +
                              " " + G.repulsionProb);
                  G.points[0] = 0;
                }
              }
              G.repulsionProb = repulsion_start;
            }
            G.magnet.factor = magnet_start;
          }
          G.targetSize = targetSize_start;
        }
        G.lifetime = lifetime_start;
      }
      G.multiplier = multiplier_start;
    }
    G.nBalls = nBalls_start;
}

console.log("# Starting test run");

testrun();

console.log("# Testrun ended");
