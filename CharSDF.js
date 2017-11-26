
var TinySDF = require('./TinySDF');

var CharSDF = module.exports = function (fontSize, buffer, radius, cutoff, fontFamily, fontWeight) {
    this.fontSize = fontSize || 24;
    this.buffer = buffer === undefined ? 3 : buffer;
    TinySDF.call(this, this.fontSize + this.buffer * 2, radius, cutoff);
    this.fontFamily = fontFamily || 'sans-serif';
    this.fontWeight = fontWeight || 'normal';
    this.ctx.font = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = "center";
};

CharSDF.prototype = Object.create(TinySDF.prototype);

CharSDF.prototype.draw = function (char, angle) {
    this.ctx.clearRect(0, 0, this.size, this.size);
    this.ctx.translate(this.size/2,this.size/2);
    this.ctx.rotate(angle || 0);
    this.ctx.translate(-this.size/2,-this.size/2);
    this.ctx.fillText(char, this.size/2, this.middle);
    return this.sdfAlpha();
};