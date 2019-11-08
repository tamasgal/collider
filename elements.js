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
        x = this.x + this.dx;
        y = this.y + this.dy;
        this.x = x;
        this.y = y;
    }

    this.draw = function() {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.fill();
    }
}


var Target = function(x, y, r, c='#f55b5b', lifetime=1000, generation=1) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = c;
    this.lifetime = lifetime;
    this.original_lifetime = lifetime;
    this.generation = generation;

    this.tick = function() {
        this.lifetime -= 1;
        if(this.lifetime - this.original_lifetime > -10) {
            this.r += Math.cos(this.lifetime) * 2;
        }
    }

    this.draw = function() {
        var a = this.lifetime / this.original_lifetime;
        var r = Math.round(this.generation / G.n_balls);
        var g = 0;
        var b = 1 - r;
        ctx.beginPath();
        ctx.fillStyle = rgba(r, g, b, a);
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.fill();
        ctx.font = "bold 15px Courier";
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgb(255, 255, 255, ' + a + ')';
        ctx.fillText(this.generation, this.x, this.y);
    }
}
