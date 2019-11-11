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

    this.draw = function() {
        ctx.fillStyle = C.button;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = C.button_text;
        ctx.font = "bold 15px Courier";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + 5, this.y + Math.round(this.height / 2));
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
        ctx.fillStyle = '#fff';
        this.adjustUpgradeProgress();
        ctx.fillRect(this.x, this.y + this.height, this.upgradeProgress * this.width, 2);
        if(G.points >= this.nextUpgrade()) {
            ctx.fillStyle = C.upgrade_button_active;
        } else {
            ctx.fillStyle = C.upgrade_button_inactive;
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
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
        ctx.fillText(this.text, this.x + 5, this.y + Math.round(this.height / 2) + 2);
        ctx.textAlign = 'right';
        ctx.fillText(this.displayValue(), this.x + this.width - 5, this.y + Math.round(this.height / 2) + 2);
        ctx.textAlign = 'left';
        ctx.fillText("LVL " + this.getLevel() + suffix, this.x + this.width + 5, this.y + Math.round(this.height / 2) + 2);
    }

    this.click = function() {
        var factor = G.upgradeFactor;
        if(factor == "MAX") {
            factor = this.highestPossibleUpgrade();
        }
        for(var i=0; i<factor; i++) {
            var cost = this.nextUpgrade();
            if(G.points >= cost) {
                addPoints(-cost);
                this.increaseLevel(1);
                this.upgrade();
            }
        }
    }
    this.hover = function(x, y) {
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
        var points = G.points;
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
        var progress = G.points / cost;
        if(G.points >= cost) {
            progress = 1.0;
        }
        this.upgradeProgress += (progress - this.upgradeProgress) / 2;
    }
}
