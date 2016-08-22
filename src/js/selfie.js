/**
 * Color Matrix
 *
 * A simplification of the color matrix class provided by
 * EaselJS
 *
 * www.createjs.com/docs/easeljs/files/easeljs_filters_ColorFilter.js.html#l41
 */

var colorMatrix = (function() {
  var DELTA_INDEX = [
    0,    0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1,  0.11,
    0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24,
    0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42,
    0.44, 0.46, 0.48, 0.5,  0.53, 0.56, 0.59, 0.62, 0.65, 0.68,
    0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98,
    1.0,  1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54,
    1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.0,  2.12, 2.25,
    2.37, 2.50, 2.62, 2.75, 2.87, 3.0,  3.2,  3.4,  3.6,  3.8,
    4.0,  4.3,  4.7,  4.9,  5.0,  5.5,  6.0,  6.5,  6.8,  7.0,
    7.3,  7.5,  7.8,  8.0,  8.4,  8.7,  9.0,  9.4,  9.6,  9.8,
    10.0
  ];

  function multiply (a, b) {
    var i, j, k, col = [];

    for (i = 0; i < 5; i++) {
      for (j = 0; j < 5; j++) {
        col[j] = a[j + i * 5];
      }
      for (j = 0; j < 5; j++) {
        var val = 0;
        for (k = 0; k < 5; k++) {
          val += b[j + k * 5] * col[k];
        }
        a[j + i * 5] = val;
      }
    }
  };

  function colorMatrix (imageData, options) {
    var brightness = options.brightness || 0;
    var contrast   = options.contrast   || 0;

    var matrix = [
      1, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ];

    // Contrast
    var x;
    if (contrast < 0) {
      x = 127 + contrast / 100 * 127;
    } else {
      x = contrast % 1;

      if (x === 0) {
        x = DELTA_INDEX[contrast];
      } else {
        x = DELTA_INDEX[(+contrast)] * (1 - x) + DELTA_INDEX[(+contrast) + 1] * x;
      }

      x = x * 127 + 127;
    }

    multiply (matrix, [
      x / 127, 0, 0, 0, 0.5 * (127 - x),
      0, x / 127, 0, 0, 0.5 * (127 - x),
      0, 0, x / 127, 0, 0.5 * (127 - x),
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ]);

    // Brightness
    multiply (matrix,[
      1, 0, 0, 0, brightness,
      0, 1, 0, 0, brightness,
      0, 0, 1, 0, brightness,
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ]);

    // Apply Filter
    var data = imageData.data;
    var l = data.length;
    var r, g, b, a;
    var m0 =  matrix[0],  m1 =  matrix[1],  m2 =  matrix[2],  m3 =  matrix[3],  m4 =  matrix[4];
    var m5 =  matrix[5],  m6 =  matrix[6],  m7 =  matrix[7],  m8 =  matrix[8],  m9 =  matrix[9];
    var m10 = matrix[10], m11 = matrix[11], m12 = matrix[12], m13 = matrix[13], m14 = matrix[14];
    var m15 = matrix[15], m16 = matrix[16], m17 = matrix[17], m18 = matrix[18], m19 = matrix[19];

    for (var i=0; i<l; i+=4) {
      r = data[i];
      g = data[i+1];
      b = data[i+2];
      a = data[i+3];
      data[i] = r * m0 + g * m1 + b * m2 + a * m3 + m4; // red
      data[i + 1] = r * m5 + g * m6 + b * m7 + a * m8 + m9; // green
      data[i + 2] = r * m10 + g * m11 + b * m12 + a * m13 + m14; // blue
      data[i + 3] = r * m15 + g * m16 + b * m17 + a * m18 + m19; // alpha
    }

    return imageData;
  }

  return colorMatrix;
})();

/**
 * https://www.viget.com/articles/instagram-style-filters-in-html5-canvas
 */
var toasterGradient = function (width, height) {
  var texture = document.createElement('canvas');
  var ctx = texture.getContext('2d');

  texture.width = width;
  texture.height = height;

  // Fill a Radial Gradient
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
  var gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.6);

  gradient.addColorStop(0, '#804e0f');
  gradient.addColorStop(1, '#3b003b');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return ctx;
};

var blend = function (background, foreground, width, height, transform) {
  var bottom = background.getImageData(0, 0, width, height);
  var top = foreground.getImageData(0, 0, width, height);

  for (var i = 0, size = top.data.length; i < size; i += 4) {
    // red
    top.data[i + 0] = transform(bottom.data[i + 0], top.data[i + 0]);
    // green
    top.data[i + 1] = transform(bottom.data[i + 1], top.data[i + 1]);
    // blue
    top.data[i + 2] = transform(bottom.data[i + 2], top.data[i + 2]);
    // the fourth slot is alpha. We don't need that (so skip by 4)
  }

  return top;
};

var ready = function () {
  var video = jj('#user-video'),
      selfie = jj('#selfie'),
      startCamera = jj('#start-camera'),
      shutter = jj('#shutter'),
      removeSelfie = jj('#remove-selfie'),
      downloadSelfie = jj('#download-selfie'),
      controller = jj('#controller');

  var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  var getVideo = function () {
    hideButtons();
  };

  var takePhoto = function () {
    var store = jj('#selfie-store'),
        ctx = store.getContext('2d');

    var width = video.videoWidth,
        height = video.videoHeight;

    if (width && height) {
      store.width = width;
      store.height = height;

      ctx.drawImage(video, 0, 0, width, height);

      /*****/
      /*
      var gradient = toasterGradient(width, height);

      var screen = blend(ctx, gradient, width, height, function(bottomPixel, topPixel) {
        return 255 - (255 - topPixel) * (255 - bottomPixel) / 255;
      });

      var colorCorrected = colorMatrix(screen, { contrast: 30, brightness: -30 });
      ctx.putImageData(colorCorrected, 0, 0);
      */
      /*****/

      return store.toDataURL('image/png');
    }
  };

  var hideButtons = function () {
    controller.setAttribute('class', controller.getAttribute('class').replace(/\s?none/g, '') + ' none');
    startCamera.setAttribute('class', startCamera.getAttribute('class').replace(/\s?none/g, '') + ' none');
  };

  if (!getUserMedia) {
    alert('현재 브라우저는 유저 미디어를 지원하지 않습니다.');
  } else {
    getUserMedia.call(navigator, {
        video: true
      },
      function (stream) {
        if (window.URL) {
          video.src = window.URL.createObjectURL(stream);
        } else {
          video.src = stream;
        }

        video.onplay = function() {
          getVideo();
        };

        video.play();
      },
      function (err) {
        alert('카메라 스트림에 접근하는 과정 중 에러가 발생했습니다.');
      }
    );
  }

  addEvent(startCamera, 'click', function (e) {
    video.play();
    getVideo();
  });

  addEvent(shutter, 'click', function (e) {
    var snap = takePhoto();

    selfie.setAttribute('src', snap);
    downloadSelfie.setAttribute('href', snap);
    controller.setAttribute('class', controller.getAttribute('class').replace(/\s?none/g, ''));
    // video.pause();
  });

  addEvent(removeSelfie, 'click', function (e) {
    selfie.setAttribute('src', '');
    controller.setAttribute('class', controller.getAttribute('class').replace(/\s?none/g, '') + ' none');
    // video.play();
  });
};

