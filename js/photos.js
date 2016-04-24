var ready = function () {
  var bodyContainer = document.getElementById('body-container');
  var moreFeed = document.getElementById('get-insta-feed');
  var feed = new Instafeed({
    get: 'user',
    userId: 'self',
    target: 'body-container',
    limit: 30,
    resolution: 'standard_resolution',
    accessToken: '1591191525.212f7be.ef028729cb9c4722bb04fc76b6515088',
    clientId: '212f7be0b6d643318eda9413aecb1cf3',
    template: '<a class="insta-card" href="{{link}}"><img src="{{image}}" /></a>',
    before: function () {
    },
    success: function (res) {
      // console.log(res);
    },
    after: function () {
      if (!this.hasNext()) {
        bodyContainer.removeChild(moreFeed);
      }
    }
  });

  window.onscroll = function (event) {
    var e = event || window.event;
    var bodyContainer, pagination;

    bodyContainer = document.getElementById('body-container');
    pagination = document.getElementsByClassName('pagination')[0];

    currentX = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
    currentY = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

    if (moreFeed) {
      if (currentY + document.body.clientHeight > document.body.scrollHeight - 50) {
        feed.next();
      }
    }
  };

  if (document.addEventListener) {
    moreFeed.addEventListener('click', function () {
      feed.next();
    }, false);
  } else if (document.attachEvent) {
    moreFeed.attachEvent('onclick', function () {
      feed.next();
    });
  }

  feed.run();
};

