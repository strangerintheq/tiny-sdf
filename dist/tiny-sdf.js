(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

var TinySDF = require('./TinySDF');

var CharSDF = module.exports = function (fontSize, buffer, radius, cutoff, fontFamily, fontWeight) {
    this.fontSize = fontSize || 24;
    this.buffer = buffer === undefined ? 3 : buffer;
    var size = this.fontSize + this.buffer * 2;
    TinySDF.call(this, size, size, radius, cutoff);
    this.fontFamily = fontFamily || 'sans-serif';
    this.fontWeight = fontWeight || 'normal';
    this.ctx.font = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = "center";
};

CharSDF.prototype = Object.create(TinySDF.prototype);

CharSDF.prototype.draw = function (char, angle) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.translate(this.width/2, this.height/2);
    this.ctx.rotate(angle || 0);
    this.ctx.translate(-this.width/2,-this.height/2);
    this.ctx.fillText(char, this.width/2, this.middle);
    return this.sdfAlpha();
};
},{"./TinySDF":3}],2:[function(require,module,exports){

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
},{"./TinySDF":3}],3:[function(require,module,exports){
var INF = 1e20;

var TinySDF = module.exports = function (width, height, radius, cutoff) {
    this.radius = radius || 8;
    this.cutoff = cutoff || 0.25;
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width =width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    // temporary arrays for the distance transform
    this.gridOuter = new Float64Array(width * height);
    this.gridInner = new Float64Array(width * height);
    this.f = new Float64Array(height);
    this.d = new Float64Array(width);
    this.z = new Float64Array(width + 1);
    this.v = new Int16Array(width);

    // hack around https://bugzilla.mozilla.org/show_bug.cgi?id=737852
    this.middle = Math.round((height / 2) * (navigator.userAgent.indexOf('Gecko/') >= 0 ? 1.2 : 1));
};

TinySDF.prototype.clear = function(){
    this.ctx.clearRect(0, 0, this.size, this.size);
};

TinySDF.prototype.sdfAlpha = function (){
    var imgData = this.ctx.getImageData(0, 0, this.width, this.height);
    var alphaChannel = new Uint8ClampedArray(this.width * this.height);

    for (var i = 0; i < this.width * this.height; i++) {
        var a = imgData.data[i * 4 + 3] / 255; // alpha value
        this.gridOuter[i] = a === 1 ? 0 : a === 0 ? INF : Math.pow(Math.max(0, 0.5 - a), 2);
        this.gridInner[i] = a === 1 ? INF : a === 0 ? 0 : Math.pow(Math.max(0, a - 0.5), 2);
    }

    edt(this.gridOuter, this.width, this.height, this.f, this.d, this.v, this.z);
    edt(this.gridInner, this.width, this.height, this.f, this.d, this.v, this.z);

    for (i = 0; i < this.width * this.height; i++) {
        var d = this.gridOuter[i] - this.gridInner[i];
        alphaChannel[i] = Math.max(0, Math.min(255, Math.round(255 - 255 * (d / this.radius + this.cutoff))));
    }

    return alphaChannel;
};

TinySDF.prototype.makeRGBAImageData = function (alphaChannel, size) {
    var imageData = this.ctx.createImageData(size, size);
    var data = imageData.data;
    for (var i = 0; i < alphaChannel.length; i++) {
        data[4 * i + 0] = alphaChannel[i];
        data[4 * i + 1] = alphaChannel[i];
        data[4 * i + 2] = alphaChannel[i];
        data[4 * i + 3] = 255;
    }
    return imageData;
};

// 2D Euclidean distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/dt/
function edt(data, width, height, f, d, v, z) {
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            f[y] = data[y * width + x];
        }
        edt1d(f, d, v, z, height);
        for (y = 0; y < height; y++) {
            data[y * width + x] = d[y];
        }
    }
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            f[x] = data[y * width + x];
        }
        edt1d(f, d, v, z, width);
        for (x = 0; x < width; x++) {
            data[y * width + x] = Math.sqrt(d[x]);
        }
    }
}

// 1D squared distance transform
function edt1d(f, d, v, z, n) {
    v[0] = 0;
    z[0] = -INF;
    z[1] = +INF;

    for (var q = 1, k = 0; q < n; q++) {
        var s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) {
            k--;
            s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        }
        k++;
        v[k] = q;
        z[k] = s;
        z[k + 1] = +INF;
    }

    for (q = 0, k = 0; q < n; q++) {
        while (z[k + 1] < q) k++;
        d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
    }
}

},{}],4:[function(require,module,exports){
'use strict';

window.SDF = module.exports = {
    TinySDF: require('./TinySDF'),
    CharSDF: require('./CharSDF'),
    ImageSDF: require('./ImageSDF')
};
},{"./CharSDF":1,"./ImageSDF":2,"./TinySDF":3}]},{},[4]);
