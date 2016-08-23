var ready = function () {
  var s = selfie.init({
    target: jj('#playground'),
    fileName: 'selfie',
    downloadLinkText: '받기',
    camera: {
      id: 'user-video'
    },
    store: {
      id: 'selfie-store',
      class: 'none'
    },
    photo: {
      id: 'selfie'
    },
    download: {
      id: 'download-selfie',
      activeClass: 'active',
      unactiveClass: 'none',
      class: 'rm-style-button btn btn-primary'
    }
  });

  addEvent(jj('#shutter'), 'click', s.takePhoto);
  addEvent(jj('#remove-selfie'), 'click', s.removePhoto);
};

