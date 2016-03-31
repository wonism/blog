/**
 *
 * title   : Easy Map JS
 *
 * version : 0.1.0 (Beta)
 *
 * author  : Jaewon
 *
 * license : MIT
 *
 * github  : https://www.github.com/wonism
 *
 */

;(function () {
  var easyMap, EasyMap, userBrowser, isOlderIE, isMobile;

  // Variable for Singletone instance
  var _easyMapInstance;

  userBrowser = window.navigator.userAgent;
  isOlderIE = userBrowser.match(/MSIE [4-8]/) ? true : false;
  isMobile = userBrowser.toLowerCase().match(/android | webos | iphone | ipad | ipod | blackberry | windows phone/) ? true : false;

  // Query Selector Polyfill
  if (!document.querySelectorAll) {
    document.querySelectorAll = function (selectors) {
      var style, elements, element;

      style = document.createElement('style'), elements = [];
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

  easyMap = {
    init: function(elementId, key, center, coords, infoWindowAutoClose, functionAtNestedMarker) {
      if (arguments.length < 1) {
        throw new Error('Invalid parameters !!!');
        return false;
      }

      if (isOlderIE) {
        throw new Error('\'Not Support\' in this Browser !!!');
        return false;
      }

      return _easyMapInstance || new EasyMap(elementId, key, center, coords, infoWindowAutoClose, functionAtNestedMarker);
    },
    version: "0.1.0"
  };

  EasyMap = function(elementId, key, center, coords, infoWindowAutoClose, functionAtNestedMarker) {
    var mapType, mapTypeArr, settedFlag = false;

    _easyMapInstance = this;

    mapTypeArr = ['google', 'naver', 'daum'];

    mapType = document.getElementById(elementId).getAttribute('data-map-type');
    mapType = mapTypeArr.indexOf(mapType) > -1 ? mapType : 'google';

    _easyMapInstance.map = {};
    _easyMapInstance.mapElement = document.getElementById(elementId);
    _easyMapInstance.key = key;
    _easyMapInstance.mapType = mapType;
    _easyMapInstance.center = center;
    _easyMapInstance.coordsArr = coords;
    _easyMapInstance.infoWindowAutoClose = infoWindowAutoClose;
    _easyMapInstance.functionAtNestedMarker = functionAtNestedMarker;
    _easyMapInstance.markersArr = [];
    _easyMapInstance.centerInfoWindow = {};
    _easyMapInstance.coordsInfoWindow = {};
    _easyMapInstance.currentMarker = {};
    _easyMapInstance.markerIdArr = [];
    _easyMapInstance.markerNameArr = [];

    _easyMapInstance.runningG();
  };

  EasyMap.prototype.getDistance = function (lat, lng) {
    var R, dLat, dLng, a, b, c;

    R = 6371000;
    dLat = _easyMapInstance.deg2rad(lat - _easyMapInstance.center.lat);
    dLng = _easyMapInstance.deg2rad(lng - _easyMapInstance.center.lng);
    a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(_easyMapInstance.deg2rad(lat)) * Math.cos(_easyMapInstance.deg2rad(_easyMapInstance.center.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    c = R * b;

    return Math.round(c);
  };

  EasyMap.prototype.deg2rad = function (deg) {
    return deg * (Math.PI / 180);
  };

  EasyMap.prototype.addEvent = function(element, events, callback) {
    var event, eventCounter, eventLength;
    var moderator;

    moderator = function(e) {
      var e = e || window.event;

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

    events = events.split(" ");
    eventCounter = 0;
    eventLength = events.length;

    for (; eventCounter < eventLength; eventCounter++) {
      event = events[eventCounter];

      if (element.addEventListener) {
        element.addEventListener(event, callback, false);
      } else {
        element.attachEvent("on" + event, moderator);
      }
    }

    return _easyMapInstance;
  };

  EasyMap.prototype.initOptionsG = function () {
    return new google.maps.Map(_easyMapInstance.mapElement, {
      center: _easyMapInstance.center,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      panControl: false,
      zoomControl: true,
      scaleControl: true
    });
  };

  EasyMap.prototype.getCurrentPositionG = function () {
    if (_easyMapInstance.center.marker && _easyMapInstance.center.marker.icon) {
      var useIcon, useSize;
      var markerWidth, markerHeight, markerAlignType, markerVVerticalPosition;

      markerWidth = _easyMapInstance.center.marker.size ? _easyMapInstance.center.marker.size.match(/(\d{1,3})(?:x\d{1,3})/)[1] >> 0 : 0;
      markerHeight = _easyMapInstance.center.marker.size ? _easyMapInstance.center.marker.size.match(/(?:\d{1,3}x)(\d{1,3})/)[1] >> 0 : 0;

      markerAlignType = _easyMapInstance.center.verticalAlign;

      if (markerAlignType === 'top') {
        markerVerticalPosition = 0;
      } else if (markerAlignType === 'bottom') {
        markerVerticalPosition = markerHeight;
      } else {
        markerVerticalPosition = markerHeight / 2;
      }

      useSize = markerWidth && markerHeight ? true : false;

      if (useSize) {
        _easyMapInstance.currentMarker = new google.maps.Marker({
          position: _easyMapInstance.center,
          map: _easyMapInstance.map,
          icon: new google.maps.MarkerImage(
            _easyMapInstance.center.marker.icon,
            new google.maps.Size(markerWidth, markerHeight),
            new google.maps.Point(0, 0),
            new google.maps.Point(markerWidth / 2, markerVerticalPosition),
            new google.maps.Size(markerWidth, markerHeight)
          )
        });
      } else {
        _easyMapInstance.currentMarker = new google.maps.Marker({
          position: _easyMapInstance.center,
          map: _easyMapInstance.map,
          icon: new google.maps.MarkerImage(
            _easyMapInstance.center.marker.icon
          )
        });
      }
    } else {
      _easyMapInstance.currentMarker = new google.maps.Marker({
        position: _easyMapInstance.center,
        map: _easyMapInstance.map
      });
    }
    if (_easyMapInstance.center.info) {
      _easyMapInstance.centerInfoWindow = new google.maps.InfoWindow({ content: _easyMapInstance.center.info.markup, maxWidth: _easyMapInstance.center.info.maxWidth });
    }
  };

  EasyMap.prototype.createMarkersG = function () {
    var coordCounter = 0;
    for (; coordCounter < _easyMapInstance.coordsArr.length; coordCounter++) {
      if (_easyMapInstance.coordsArr[coordCounter].marker && _easyMapInstance.coordsArr[coordCounter].marker.icon) {
        var useIcon, useSize;
        var markerWidth, markerHeight, markerAlignType, markerVerticalPosition;

        markerWidth = _easyMapInstance.coordsArr[coordCounter].marker.size ? _easyMapInstance.coordsArr[coordCounter].marker.size.match(/(\d{1,3})(?:x\d{1,3})/)[1] >> 0 : 0;
        markerHeight = _easyMapInstance.coordsArr[coordCounter].marker.size ? _easyMapInstance.coordsArr[coordCounter].marker.size.match(/(?:\d{1,3}x)(\d{1,3})/)[1] >> 0 : 0;

        markerAlignType = _easyMapInstance.coordsArr[coordCounter].marker.verticalAlign;

        if (markerAlignType === 'top') {
          markerVerticalPosition = 0;
        } else if (markerAlignType === 'bottom') {
          markerVerticalPosition = markerHeight;
        } else {
          markerVerticalPosition = markerHeight / 2;
        }

        useSize = markerWidth && markerHeight ? true : false;

        if (useSize) {
          _easyMapInstance.markersArr[coordCounter] = new google.maps.Marker({
            position: _easyMapInstance.coordsArr[coordCounter],
            map: _easyMapInstance.map,
            icon: new google.maps.MarkerImage(
              _easyMapInstance.coordsArr[coordCounter].marker.icon,
              new google.maps.Size(markerWidth, markerHeight),
              new google.maps.Point(0, 0),
              new google.maps.Point(markerWidth / 2, markerVerticalPosition),
              new google.maps.Size(markerWidth, markerHeight)
            )
          });
        } else {
          _easyMapInstance.markersArr[coordCounter] = new google.maps.Marker({
            position: _easyMapInstance.coordsArr[coordCounter],
            map: _easyMapInstance.map,
            icon: new google.maps.MarkerImage(
              _easyMapInstance.coordsArr[coordCounter].marker.icon
            )
          });
        }
      } else {
        _easyMapInstance.markersArr[coordCounter] = new google.maps.Marker({
          position: _easyMapInstance.coordsArr[coordCounter],
          map: _easyMapInstance.map
        });
      }
    }

    coordCounter = 0;
    for (; coordCounter < _easyMapInstance.coordsArr.length; coordCounter++) {
      _easyMapInstance.markersArr[coordCounter]['__id__'] = coordCounter;
      _easyMapInstance.markersArr[coordCounter]['__name__'] = _easyMapInstance.coordsArr[coordCounter].name || coordCounter + 1;
      _easyMapInstance.markersArr[coordCounter]['__distance__'] = _easyMapInstance.getDistance(_easyMapInstance.coordsArr[coordCounter].lat, _easyMapInstance.coordsArr[coordCounter].lng);

      if (_easyMapInstance.coordsArr[coordCounter].info) {
        var infoWindowMarkup = _easyMapInstance.coordsArr[coordCounter].info.markup;

        while (infoWindowMarkup.match(/(?:\{{2})(distance\skm)(?:\}{2})/i)) {
          infoWindowMarkup = infoWindowMarkup.replace(/(?:\{{2})(distance\skm)(?:\}{2})/i, _easyMapInstance.markersArr[coordCounter]['__distance__'] / 1000);
        }

        while (infoWindowMarkup.match(/(?:\{{2})(distance\sm)(?:\}{2})/i)) {
          infoWindowMarkup = infoWindowMarkup.replace(/(?:\{{2})(distance\sm)(?:\}{2})/i, _easyMapInstance.markersArr[coordCounter]['__distance__']);
        }

        _easyMapInstance.coordsInfoWindow[coordCounter] = new google.maps.InfoWindow({ content: infoWindowMarkup, maxWidth: _easyMapInstance.coordsArr[coordCounter].info.maxWidth });
      }
    }
  };

  EasyMap.prototype.infoWindowEventsG = function () {
    var coordCounter;

    google.maps.event.addListener(_easyMapInstance.currentMarker, 'click', function () {
      _easyMapInstance.map.setCenter(this.getPosition());

      if (_easyMapInstance.infoWindowAutoClose) {
        coordCounter = 0;
        for (; coordCounter < _easyMapInstance.coordsArr.length; coordCounter++) {
          _easyMapInstance.coordsInfoWindow[coordCounter].close();
        }
      }

      _easyMapInstance.centerInfoWindow.open(_easyMapInstance.map, this);
    });

    coordCounter = 0;
    for (; coordCounter < _easyMapInstance.coordsArr.length; coordCounter++) {
      google.maps.event.addListener(_easyMapInstance.markersArr[coordCounter], 'click', function () {
        var tempCoordsArr, markerCounter;

        tempCoordsArr = [];

        markerCounter = 0;
        for (; markerCounter < _easyMapInstance.markersArr.length; markerCounter++) {
          if (this.getPosition().lat() === _easyMapInstance.markersArr[markerCounter].position.lat() && this.getPosition().lng() === _easyMapInstance.markersArr[markerCounter].position.lng()) {
            tempCoordsArr.push(_easyMapInstance.markersArr[markerCounter]);
          }
        }

        if (tempCoordsArr.length === 1 || typeof _easyMapInstance.functionAtNestedMarker !== 'function') {
          _easyMapInstance.map.setCenter(this.getPosition());

          if (_easyMapInstance.infoWindowAutoClose) {
            _easyMapInstance.centerInfoWindow.close();

            var innerCoordCounter = 0;
            for (; innerCoordCounter < _easyMapInstance.coordsArr.length; innerCoordCounter++) {
              _easyMapInstance.coordsInfoWindow[innerCoordCounter].close();
            }
          }

          _easyMapInstance.coordsInfoWindow[this.__id__].open(_easyMapInstance.map, this);
        } else {
          var tempArrCounter;

          _easyMapInstance.markerNameArr.length = 0;
          _easyMapInstance.markerIdArr.length = 0;

          tempArrCounter = 0;
          for (; tempArrCounter < tempCoordsArr.length; tempArrCounter++) {
            _easyMapInstance.markerNameArr.push((tempCoordsArr[tempArrCounter].__id__ + 1) + '. ' + tempCoordsArr[tempArrCounter].__name__);
            _easyMapInstance.markerIdArr.push(tempCoordsArr[tempArrCounter].__id__);
          }

          _easyMapInstance.functionAtNestedMarker(_easyMapInstance.selectOneG, _easyMapInstance.markerIdArr, _easyMapInstance.markerNameArr.join('\n'));
        }
      });
    }
  };

  EasyMap.prototype.showMapG = function () {
    _easyMapInstance.getCurrentPositionG(_easyMapInstance.map);
    _easyMapInstance.createMarkersG(_easyMapInstance.map);
    _easyMapInstance.infoWindowEventsG(_easyMapInstance.map);
  };

  EasyMap.prototype.selectOneG = function (selectedMarkerNumber) {
    selectedMarkerNumber = selectedMarkerNumber >> 0;

    if (_easyMapInstance.markerIdArr.indexOf(selectedMarkerNumber) > -1) {
      _easyMapInstance.map.setCenter(_easyMapInstance.markersArr[selectedMarkerNumber].getPosition());

      if (_easyMapInstance.infoWindowAutoClose) {
        _easyMapInstance.centerInfoWindow.close();

        var innerCoordCounter = 0;
        for (; innerCoordCounter < _easyMapInstance.coordsArr.length; innerCoordCounter++) {
          _easyMapInstance.coordsInfoWindow[innerCoordCounter].close();
        }
      }

      _easyMapInstance.coordsInfoWindow[_easyMapInstance.markersArr[selectedMarkerNumber].__id__].open(_easyMapInstance.map, _easyMapInstance.markersArr[selectedMarkerNumber]);
    }
  };

  EasyMap.prototype.runningG = function () {
    var script;

    script = document.createElement('script');
    script.type = 'text/javascript';

    if (_easyMapInstance.mapType === 'google') {
      var timestamp = +new Date();
      script.src = '//maps.googleapis.com/maps/api/js?key=' + _easyMapInstance.key + '&callback=' + 'easyMap' + timestamp + '&libraries=geometry';

      window['easyMap' + timestamp] = function () {
        _easyMapInstance.map = _easyMapInstance.initOptionsG();

        _easyMapInstance.showMapG();
      };

      document.body.appendChild(script);
    } else {

    }

    return _easyMapInstance;
  };

  window.easyMap = easyMap;

})();

