
var SDF = require('./SDF');

var ImageSDF = module.exports = function (radius, cutoff, size){
    SDF.call(this, radius, cutoff, size);
};

ImageSDF.prototype = Object.create(SDF.prototype);

ImageSDF.prototype.draw = function (image) {
    this.ctx.clearRect(0, 0, this.size, this.size);
    this.ctx.drawImage(image,0, 0, this.size, this.size);
    return this.sdf();
};