var ua = window.navigator.userAgent.toLowerCase();
var isIe = ua.match(/msie/) ? true : false;
var isMobile = ua.match(/iphone|ipad|ipod|android|blackberry|iemobile/) ? true : false;
var isIos = ua.match(/iphone|ipad|ipod/) ? true : false;
var isAnd = ua.match(/android/) ? true : false;
var ieVersion = ua.match(/trident/) ? 11 : ua.match(/msie/) ? ua.split(/msie/)[1].split(/\;/)[0] : 0;

if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', function () {
    document.removeEventListener('DOMContentLoaded', arguments.callee, false);
    ready();
    common();
  }, false);
} else if (document.attachEvent) {
  document.attachEvent('onreadystatechange', function () {
    if (document.readyState === 'complete') {
      document.detachEvent('onreadystatechange', arguments.callee);
      common();
    }
  });
}

// Query Selector Polyfill
if (!document.querySelectorAll) {
  document.querySelectorAll = function (selectors) {
    var style, elements, element;

    style = document.createElement('style');
    elements = [];
    element = undefined;

    document.documentElement.firstChild.appendChild(style);
    document._qsa = [];

    style.styleSheet.cssText = selectors + '{ x-qsa: expression(document._qsa && document._qsa.push(this)) }';
    window.scrollBy(0, 0);
    style.parentNode.removeChild(style);

    while (document._qsa.length) {
      element = document._qsa.shift();
      element.style.removeAttribute('x-qsa');
      elements.push(element);
    }

    document._qsa = null;
    return elements;
  };
}

if (!document.querySelector) {
  document.querySelector = function (selectors) {
    var elements = document.querySelectorAll(selectors);
    return (elements.length) ? elements[0] : null;
  };
}

var supportPageOffset = window.pageXOffset !== undefined;
var isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

var userBrowser = window.navigator.userAgent;
var isOlderIE = userBrowser.match(/MSIE [4-8]/) ? true : false;
var isMobile = userBrowser.toLowerCase().match(/android | webos | iphone | ipad | ipod | blackberry | windows phone/) ? true : false;

var w = document.documentElement.clientWidth;
var h = document.documentElement.clientHeight;

var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

var currentX = x;
var currentY = y;

var addEvent = function (element, events, callback) {
  var event, eventCounter, eventLength;
  var moderator;

  moderator = function (event) {
    var e = event || window.event;

    if (!e.target) {
      e.target = e.srcElement;
    }

    if (!e.preventDefault) {
      e.preventDefault = function () {
        e.returnValue = false;
        e.defaultPrevented = true;
      };
    }

    return callback.call(this, e);
  };

  events = events.split(' ');
  eventCounter = 0;
  eventLength = events.length;

  for (; eventCounter < eventLength; eventCounter++) {
    event = events[eventCounter];

    if (element.addEventListener) {
      element.addEventListener(event, callback, false);
    } else {
      element.attachEvent('on' + event, moderator);
    }
  }
};

var common = function () {
  var headerHamburger = document.querySelectorAll('#header .hamburger')[0];
  var navigatorHamburger = document.querySelectorAll('#slide-navigator .hamburger')[0];
  var navigator = document.getElementById('slide-navigator');

  addEvent(headerHamburger, 'click', function(e) {
    var thisClass = this.getAttribute('class');
    if (!thisClass.match(/\sactive/)) {
      this.setAttribute('class', thisClass + ' active');
      navigator.setAttribute('class', navigator.getAttribute('class') + ' active');
      setTimeout(function() {
        navigator.setAttribute('class', navigator.getAttribute('class') + ' visible');
      }, 1);
      navigatorHamburger.setAttribute('class', navigatorHamburger.getAttribute('class') + ' active');
    }
  });

  addEvent(navigatorHamburger, 'click', function(e) {
    var thisClass = this.getAttribute('class');
    if (thisClass.match(/\sactive/)) {
      this.setAttribute('class', thisClass.replace(/\sactive/, ''));
      navigator.setAttribute('class', navigator.getAttribute('class').replace(/\svisible/, ''));
      setTimeout(function() {
        navigator.setAttribute('class', navigator.getAttribute('class').replace(/\sactive/, ''));
      }, 500);
      headerHamburger.setAttribute('class', headerHamburger.getAttribute('class').replace(/\sactive/, ''));
    }
  });

};

