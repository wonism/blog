;(function () {
  var _jstagramInstance;

  var jstagram = {
    init: function () {
      return _jstagramInstance || new JStagram();
    },
    version: '0.1.0'
  };

  function JStagram() {
    _jstagramInstance = this;
    _jstagramInstance.canvas = {};

    _jstagramInstance.canvas.getPixels = function (img) {
      var canvas = _jstagramInstance.canvas.getCanvas(img.width, img.height),
          context = canvas.getContext('2d');

      context.drawImage(img, 0, 0, img.width, img.height);
      return context.getImageData(0, 0, canvas.width, canvas.height);
    };

    _jstagramInstance.canvas.getCanvas = function (width, height) {
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      return canvas;
    };

    _jstagramInstance.canvas.renderCanvas = function (img, newPixels) {
      var canvas, context;
      canvas  = _jstagramInstance.canvas.getCanvas(img.width, img.height);
      context = canvas.getContext('2d');
      context.putImageData(newPixels, 0, 0);
      img.src = canvas.toDataURL();
      return;
    };
  }

  JStagram.prototype.process = function (imageData) {
    var effect  = imageData.effects, // effect name
        pixraw  = imageData.pixels,  // context.getImageData()
        pix     = pixraw.data,  // image data (pixels)
        width   = pixraw.width,
        height  = pixraw.height;

    _jstagramInstance.filter(imageData, effect, pix);
    _jstagramInstance.canvas.renderCanvas(jj('#aaa'), pixraw);
  };

  JStagram.prototype.filter = function (imageData, effect, pix) {
    switch (effect) {
      case 'lark':
        var lag_r  = new Lagrange(0, 0, 1, 1);
        var lag_g  = new Lagrange(0, 0, 1, 1);
        var lag_b  = new Lagrange(0, 0, 1, 1);

        var r = [
          [ 0,   0,   0 ],
          [ 1,  30,  25 ],
          [ 2,  82,  90 ],
          [ 3, 128, 120 ],
          [ 4, 200, 230 ],
          [ 5, 255, 250 ]
        ];
        var g = [
          [ 0,   0,   0 ],
          [ 1,  48,  52 ],
          [ 2, 115, 128 ],
          [ 3, 160, 170 ],
          [ 4, 233, 245 ],
          [ 5, 255, 255 ]
        ];
        var b = [
          [ 0,   0,   0],
          [ 1,  35,  40],
          [ 2, 106, 115],
          [ 3, 151, 158],
          [ 4, 215, 219],
          [ 5, 240, 245],
          [ 6, 255, 245]
        ];

        lag_r.addMultiPoints(r);
        lag_g.addMultiPoints(g);
        lag_b.addMultiPoints(b);

        for (var i = 0, n = pix.length; i < n; i += 4){
          pix[i] = lag_r.valueOf(pix[i]);
          pix[i + 1] = lag_b.valueOf(pix[i + 1]);
          pix[i + 2] = lag_g.valueOf(pix[i + 2]);
        }

        break;
      case 'rise':
        var lag_r  = new Lagrange(0, 0, 1, 1);
        var lag_g  = new Lagrange(0, 0, 1, 1);
        var lag_b  = new Lagrange(0, 0, 1, 1);

        var r = [
          [ 0,   0,  25 ],
          [ 1,  30,  70 ],
          [ 2, 130, 192 ],
          [ 3, 170, 200 ],
          [ 4, 233, 233 ],
          [ 5, 255, 255 ]
        ];
        var g = [
          [ 0,   0,  25 ],
          [ 1,  30,  72 ],
          [ 2,  65, 118 ],
          [ 3, 100, 158 ],
          [ 4, 152, 195 ],
          [ 5, 210, 230 ],
          [ 6, 250, 250 ]
        ];
        var b = [
          [ 0,   0,  35],
          [ 1,  40,  75],
          [ 2,  82, 124],
          [ 3, 120, 162],
          [ 4, 175, 188],
          [ 5, 220, 214],
          [ 6, 255, 255]
        ];

        lag_r.addMultiPoints(r);
        lag_g.addMultiPoints(g);
        lag_b.addMultiPoints(b);

        for (var i = 0, n = pix.length; i < n; i += 4){
          pix[i]    = lag_r.valueOf(pix[i]);
          pix[i+1]  = lag_b.valueOf(pix[i+1]);
          pix[i+2]  = lag_g.valueOf(pix[i+2]);
        }

        break;
      case 'earlybird':
        var lag_r  = new Lagrange(0, 0, 1, 1);
        var lag_g  = new Lagrange(0, 0, 1, 1);
        var lag_b  = new Lagrange(0, 0, 1, 1);

        var r = [
          [ 0,   0,  25 ],
          [ 1,  45,  80 ],
          [ 2,  85, 135 ],
          [ 3, 120, 180 ],
          [ 4, 230, 240 ],
          [ 5, 255, 255 ]
        ];
        var g = [
          [ 0,   0,   0 ],
          [ 1,  40,  55 ],
          [ 2,  88, 112 ],
          [ 3, 168, 198 ],
          [ 4, 132, 172 ],
          [ 5, 215, 218 ],
          [ 6, 255, 240 ]
        ];
        var b = [
          [ 0,   0,  18],
          [ 1,  42,  58],
          [ 2,  90, 102],
          [ 3, 120, 130],
          [ 4, 164, 170],
          [ 5, 212, 195],
          [ 6, 255, 210]
        ];

        lag_r.addMultiPoints(r);
        lag_g.addMultiPoints(g);
        lag_b.addMultiPoints(b);

        for (var i = 0, n = pix.length; i < n; i += 4){
          pix[i] = lag_r.valueOf(pix[i]);
          pix[i + 1] = lag_b.valueOf(pix[i + 1]);
          pix[i + 2] = lag_g.valueOf(pix[i + 2]);
        }

        break;
      default:
        for (var i = 0, len = pix.length; i < len; i += 4){
          pix[i]     = pix[i]     * 1.24;
          pix[i + 1] = pix[i + 1] * 1.33;
          pix[i + 2] = pix[i + 2] * 1.21;
        };
        break;
    }

    imageData['pixels'].data = pix;

    return imageData;
  };

  JStagram.prototype.affect = function (img) {
    var context, obj = {};

    obj.pixels = _jstagramInstance.canvas.getPixels(img);
    obj.effects = img.getAttribute('data-effect') || 'earlybird';

    _jstagramInstance.process(obj);
  };

  function Lagrange(x1, y1, x2, y2) {
    this.xs = [x1, x2];
    this.ys = [y1, y2];
    this.ws = [];

    this.updateWeights();
  }

  Lagrange.prototype.addPoint = function (x, y) {
    this.xs.push(x);
    this.ys.push(y);
    this.updateWeights();

    return this.xs.length-1;
  }

  Lagrange.prototype.updateWeights = function () {
    var len = this.xs.length; // the number of points
    var weight;

    for (var j = 0; j < len; ++j) {
      weight = 1;
      for (var i = 0; i < len; ++i) {
        if (i != j) {
          weight *= this.xs[j] - this.xs[i];
        }
      }
      this.ws[j] = 1/weight;
    }
  }

  Lagrange.prototype.valueOf = function (x) {
    var a = 0;
    var b = 0;
    var c = 0;

    for (var j = 0; j < this.xs.length; ++j) {
      if (x != this.xs[j]) {
        a = this.ws[j] / (x - this.xs[j]);
        b += a * this.ys[j];
        c += a;
      } else {
        return this.ys[j];
      }
    }
    return b / c;
  }

  Lagrange.prototype.addMultiPoints = function(arr){
    for(var i = 0, n = arr.length; i < n; i++){
      if(arr[i][0] !== 0 && arr[i][0] !== 1){
        this.addPoint(arr[i][1], arr[i][2]);
      }
    }
  };

  window.filters = {
    lark: {

    },
    earlybird: {

    }
  };
  window.jstagram = jstagram;
})();

