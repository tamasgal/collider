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
}

var ValueButton = function(text, x, y, width, height, variable, callback) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.callback = callback;
    this.variable = variable;

    this.draw = function() {
        ctx.fillStyle = C.button;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = C.button_text;
        ctx.font = "bold 15px Courier";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text + " " + G[this.variable], this.x + 5, this.y + Math.round(this.height / 2));
    }
}
