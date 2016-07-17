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

// ClassList Polyfill
if ('document' in self) {
  // Full polyfill for browsers with no classList support
  if (!('classList' in document.createElement('_'))) {
    (function (view) {
      'use strict';

      if (!('Element' in view)) return;
      var classListProp = 'classList';
      var protoProp = 'prototype';
      var elemCtrProto = view.Element[protoProp];
      var objCtr = Object;
      var strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, '');
      };
      var arrIndexOf = Array[protoProp].indexOf || function (item) {
        var i = 0, len = this.length;
        for (; i < len; i++) {
          if (i in this && this[i] === item) {
            return i;
          }
        }
        return -1;
      };
      // Vendors: please allow content code to instantiate DOMExceptions
      var DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
      };
      var checkTokenAndGetIndex = function (classList, token) {
        if (token === '') {
          throw new DOMEx('SYNTAX_ERR', 'An invalid or illegal string was specified');
        }
        if (/\s/.test(token)) {
          throw new DOMEx('INVALID_CHARACTER_ERR', 'String contains an invalid character');
        }
        return arrIndexOf.call(classList, token);
      };
      var ClassList = function (elem) {
        var trimmedClasses = strTrim.call(elem.getAttribute('class') || '');
        var classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [];
        var i = 0, len = classes.length;
        for (; i < len; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function () {
          elem.setAttribute('class', this.toString());
        };
      };
      var classListProto = ClassList[protoProp] = [];
      var classListGetter = function () {
        return new ClassList(this);
      };
      // Most DOMException implementations don't allow calling DOMException's toString()
      // on non-DOMExceptions. Error's toString() is sufficient here.
      DOMEx[protoProp] = Error[protoProp];

      classListProto.item = function (i) {
        return this[i] || null;
      };

      classListProto.contains = function (token) {
        token += '';
        return checkTokenAndGetIndex(this, token) !== -1;
      };

      classListProto.add = function () {
        var tokens = arguments;
        var i = 0;
        var l = tokens.length;
        var token;
        var updated = false;
        do {
          token = tokens[i] + '';
          if (checkTokenAndGetIndex(this, token) === -1) {
            this.push(token);
            updated = true;
          }
        } while (++i < l);

        if (updated) {
          this._updateClassName();
        }
      };

      classListProto.remove = function () {
        var tokens = arguments;
        var i = 0, l = tokens.length;
        var token;
        var updated = false;
        var index;
        do {
          token = tokens[i] + '';
          index = checkTokenAndGetIndex(this, token);
          while (index !== -1) {
            this.splice(index, 1);
            updated = true;
            index = checkTokenAndGetIndex(this, token);
          }
        } while (++i < l);

        if (updated) {
          this._updateClassName();
        }
      };

      classListProto.toggle = function (token, force) {
        token += '';

        var result = this.contains(token);
        var method = result ? force !== true && 'remove' : force !== false && 'add';

        if (method) {
          this[method](token);
        }

        if (force === true || force === false) {
          return force;
        } else {
          return !result;
        }
      };

      classListProto.toString = function () {
        return this.join(' ');
      };

      if (objCtr.defineProperty) {
        var classListPropDesc = {
          get: classListGetter,
          enumerable: true,
          configurable: true
        };
        try {
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        } catch (ex) { // IE 8 doesn't support enumerable:true
          if (ex.number === -0x7FF5EC54) {
            classListPropDesc.enumerable = false;
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
          }
        }
      } else if (objCtr[protoProp].__defineGetter__) {
        elemCtrProto.__defineGetter__(classListProp, classListGetter);
      }
    }(self));
  } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
      'use strict';

      var testElement = document.createElement('_');

      testElement.classList.add('c1', 'c2');

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains('c2')) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle('c3', false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains('c3')) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };
      }
      testElement = null;
    }());
  }
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

var jj = function (selector) {
  if (selector.match(/\s/g)) {
    return document.querySelectorAll(selector);
  } else if (selector.match(/^\#/)) {
    return document.getElementById(selector.replace(/^\#/, ''));
  } else if (selector.match(/^\./)) {
    return document.getElementsByClassName(selector.replace(/^\./, ''));
  } else {
    return document.getElementsByTagName(selector);
  }
};

var common = function () {
  var headerHamburger = jj('#header .hamburger')[0],
      navigatorHamburger = jj('#slide-navigator .hamburger')[0],
      navigator = jj('#slide-navigator'),
      headerMenus = jj('#header ul li'),
      footerMenus = jj('#footer .list-sns a');

  addEvent(headerHamburger, 'click', function(e) {
    var thisClassList = this.classList;
    if (!thisClassList.contains('active')) {
      this.classList.add('active');
      navigator.classList.add('active');
      setTimeout(function() {
        navigator.classList.add('visible');
      }, 100);
      navigatorHamburger.classList.add('active');
      ga('send', 'event', '상단 네비게이션 바', 'Button Press', '햄버거 버튼 클릭(메뉴 열기)');
    }
  });

  addEvent(navigatorHamburger, 'click', function(e) {
    var thisClassList = this.classList;
    if (thisClassList.contains('active')) {
      this.classList.remove('active');
      navigator.classList.remove('visible');
      setTimeout(function() {
        navigator.classList.remove('active');
      }, 500);
      headerHamburger.classList.remove('active');
      ga('send', 'event', '상단 네비게이션 바', 'Button Press', '햄버거 버튼 클릭(메뉴 듣기)');
    }
  });

  var hmenuCounter = 0, hmenuLength = headerMenus.length;
  for (; hmenuCounter < hmenuLength; hmenuCounter++) {
    addEvent(headerMenus[hmenuCounter], 'click', function () {
      ga('send', 'event', '상단 네비게이션 바', 'Button Press', this.getElementsByTagName('a')[0].textContent + ' 클릭');
    });
  }

  var fmenuCounter = 0, fmenuLength = footerMenus.length;
  for (; fmenuCounter < fmenuLength; fmenuCounter++) {
    addEvent(footerMenus[fmenuCounter], 'click', function () {
      ga('send', 'event', '하단 바', 'Button Press', this.getAttribute('href'));
    });
  }
};

