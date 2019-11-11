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
    this.level = 0;
    this.upgradeCost = upgradeCost;

    this.draw = function() {
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y + this.height, this.upgradeProgress() * this.width, 2);
        if(G.points >= this.nextUpgrade()) {
            ctx.fillStyle = C.upgrade_button_active;
        } else {
            ctx.fillStyle = C.upgrade_button_inactive;
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = C.button_text;
        ctx.font = "bold 15px Courier";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + 5, this.y + Math.round(this.height / 2));
        ctx.textAlign = 'right';
        ctx.fillText(this.displayValue(), this.x + this.width - 5, this.y + Math.round(this.height / 2));
    }

    this.click = function() {
        var cost = this.nextUpgrade();
        if(G.points >= cost) {
            addPoints(-cost);
            this.level += 1;
            this.upgrade();
        }
    }
    this.hover = function(x, y) {
        ctx.fillStyle = '#fff';
        ctx.font = "bold 10px Courier";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(C.currency + ' ' + this.nextUpgrade() + " (LVL " + (this.level + 1) + ")", x+10, y);
    }

    this.nextUpgrade = function() {
        return this.upgradeCost(this.level + 1);
    }

    this.upgradeProgress = function() {
        var total = this.upgradeCost(this.level + 1) - this.upgradeCost(this.level);
        if(G.points >= total) {
            return 1.0;
        }
        return G.points / total;
    }
}
