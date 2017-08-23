
var SDF = require('./SDF');

var ImageSDF = module.exports = function (size, radius, cutoff) {
    SDF.call(this, size, radius, cutoff);
};

ImageSDF.prototype = Object.create(SDF.prototype);

ImageSDF.prototype.draw = function (image) {
    this.ctx.clearRect(0, 0, this.size, this.size);
    this.ctx.drawImage(image, 0, 0, this.size, this.size);
    return this.sdfAlpha();
};