if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
  // return;
}

navigator.mediaDevices.enumerateDevices()
  .then(function (devices) {
    var str = '';

    devices.forEach(function (device) {
      str += device.kind + ': ' + device.label + ' id = ' + device.deviceId + '<br />';
    });

    document.write(str);
  })
  .catch(function (err) {
    console.log(err.name + ': ' + error.message);
  });

var constraints = {
  video: {
    // optional: [ { sourceId: 'a6bcaea7a6bce98e06a1917e4380cdfa7c04e5245ae3e8ef7f78591adefc06d0' } ]
  }
};

navigator.getUserMedia(constraints, function () { alert('성공'); }, function () { alert('실패'); } );

