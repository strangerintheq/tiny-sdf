
var SDF = require('./SDF');

module.exports = function CharSDF(fontSize, buffer, radius, cutoff, fontFamily, fontWeight){
    this.fontSize = fontSize || 24;
    this.buffer = buffer === undefined ? 3 : buffer;
    SDF.call(this, radius, cutoff, this.fontSize + this.buffer * 2);
    this.fontFamily = fontFamily || 'sans-serif';
    this.fontWeight = fontWeight || 'normal';
    this.ctx.font = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'black';
};

CharSDF.prototype = Object.create(SDF.prototype);

CharSDF.prototype.draw = function (char) {
    this.ctx.clearRect(0, 0, this.size, this.size);
    this.ctx.fillText(char, this.buffer, this.middle);
    return this.sdf();
};