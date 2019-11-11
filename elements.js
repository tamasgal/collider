var Point = function(x, y) {
    this.x = x;
    this.y = y;
}

var Ball = function(x, y, dx, dy, r, c='#f55b5b') {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.r = r;
    this.c = c;

    this.tick = function() {
        if (this.x + this.dx > G.world.width - this.r || this.x + this.dx < this.r) {
            this.dx = -this.dx;
        }
        if (this.y + this.dy > G.world.height - this.r || this.y + this.dy < this.r) {
            this.dy = -this.dy;
        }
        if(G.magnet.factor > 0 && S.targets.length > 0) {
            dist = distance(G.magnet, this);
            mdx = (G.magnet.x - this.x) / dist * G.magnet.factor / 1000;
            mdy = (G.magnet.y - this.y) / dist * G.magnet.factor / 1000;
            this.dx += mdx;
            this.dy += mdy;
        }
        dx = this.dx;
        dy = this.dy;
        if(G.isTimewarping) {
            dx /= G.timewarpFactor;
            dy /= G.timewarpFactor;
        }
        
        x = this.x + dx;
        y = this.y + dy;
        this.x = x;
        this.y = y;
    }

    this.draw = function() {
        ctx.beginPath();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = this.c;
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1.0;
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
        var r = this.chain / G.n_balls;
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
