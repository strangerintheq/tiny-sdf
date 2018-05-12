
var TinySDF = require('./TinySDF');

var ImageSDF = module.exports = function (width, height, radius, cutoff) {
    TinySDF.call(this, width, height, radius, cutoff);
};

ImageSDF.prototype = Object.create(TinySDF.prototype);

ImageSDF.prototype.draw = function (image) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(image, 0, 0, this.width, this.height);
    return this.sdfAlpha();
};