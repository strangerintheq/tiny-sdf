
var TinySDF = require('./TinySDF');

var ImageSDF = module.exports = function (size, radius, cutoff) {
    TinySDF.call(this, size, radius, cutoff);
};

ImageSDF.prototype = Object.create(TinySDF.prototype);

ImageSDF.prototype.draw = function (image) {
    this.ctx.clearRect(0, 0, this.size, this.size);
    this.ctx.drawImage(image, 0, 0, this.size, this.size);
    return this.sdfAlpha();
};