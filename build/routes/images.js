'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _formidable = require('formidable');

var _formidable2 = _interopRequireDefault(_formidable);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _imagemagick = require('imagemagick');

var _imagemagick2 = _interopRequireDefault(_imagemagick);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _models = require('../../models');

var _models2 = _interopRequireDefault(_models);

var _config = require('../../config/config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var router = _express2.default.Router();

var isAuthor = void 0;
var userId = void 0;

isAuthor = function isAuthor(req, res, next) {
  if (req.user) {
    _models2.default.users.findById(req.user.id).then(function (user) {
      if (+user.level === 99) {
        userId = user.toJSON().id;
        return next();
      } else {
        req.flash('info', '포스트 작성 권한이 없습니다.');
        return res.redirect('/posts');
      }
    }).catch(function (err) {
      return next(err, req, res, next);
    });
  } else {
    req.flash('info', '로그인을 해주세요.');
    return res.redirect('/login');
  }
};

// Fetch all Images
router.get('/', isAuthor, function (req, res, next) {
  _models2.default.images.findAll().then(function (images) {
    return res.render('images/index', {
      title: '이미지 리스트',
      asset: 'images',
      mode: _config2.default.mode,
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/logo.png',
      description: 'Jaewonism\'s blog'.substring(0, 255),
      keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
      userId: req.user ? req.user.user_id : null,
      images: images
    });
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Form to Create Image
router.get('/new', isAuthor, function (req, res, next) {
  return res.render('images/new', {
    title: '이미지 등록',
    asset: 'images',
    mode: _config2.default.mode,
    url: 'http://' + req.headers.host + req.baseUrl + req.url,
    image: req.protocol + '://' + req.headers.host + '/images/logo.png',
    description: 'Jaewonism\'s blog'.substring(0, 255),
    keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
    userId: req.user ? req.user.user_id : null
  });
});

// Create Image
router.post('/new', isAuthor, function (req, res, next) {
  var form = new _formidable2.default.IncomingForm();
  var files = [];
  var fields = [];

  form.keepExtensions = true;
  form.uploadDir = __dirname + '/public/upload';
  form.uploadDir = form.uploadDir.replace(/routes\//, '').replace(/build\//, '');
  form.maxFieldsSize = 10 * 1024 * 1024;

  form.on('fileBegin', function (name, file) {}).on('progress', function (bytesReceived, bytesExpected) {}).on('aborted', function () {}).on('error', function (e) {
    console.log('error!!', e);
  }).on('end', function () {});

  form.parse(req, function (err, fields, files) {
    var timestamp = Date.now();
    var imageFile = files.original;

    _async2.default.waterfall([function (cb) {
      if (+_url2.default.parse(req.url, true).query.processing_type) {
        imageFile = files.file;
        cb(null, imageFile);
      } else {
        throw new Error('Invalid Processing Type');
      }
    }, function (imageFile, cb) {
      var name = imageFile.name || '' + +new Date();
      var path = imageFile.path;
      var type = imageFile.type;
      var format = void 0;

      if (_url2.default.parse(req.url, true).query.file_type) {
        format = _url2.default.parse(req.url, true).query.file_type;
      } else {
        format = name.match(/\.\w{1,5}/g)[name.match(/\.\w{1,5}/g).length - 1];
      }

      if (type.indexOf('image') !== -1 || _url2.default.parse(req.url, true).query.file_type) {
        (function () {
          var outputPath = __dirname + '/public/upload/' + 'images_' + timestamp + format;
          outputPath = outputPath.replace(/routes\/|build\//g, '');

          _fs2.default.rename(path, outputPath, function (err) {
            if (err) {
              return next(err, req, res, next);
            } else {
              var processingType = fields.processing_type;
              var imageJSON = {};

              if (+_url2.default.parse(req.url, true).query.processing_type === 2) {
                processingType = '2';
              } else if (+_url2.default.parse(req.url, true).query.processing_type === 1) {
                processingType = '1';
              }

              switch (processingType) {
                case '1':
                  _imagemagick2.default.crop({
                    srcPath: outputPath,
                    dstPath: outputPath.replace(/images_/, 'images_thumbnail_'),
                    width: 400,
                    height: 400,
                    quality: 1,
                    gravity: "Center"
                  }, function (err, stdout, stderr) {
                    if (err) throw err;
                  });

                  imageJSON = {
                    original: '/upload/images_' + timestamp + format,
                    thumbnail: '/upload/images_thumbnail_' + timestamp + format,
                    processing_type: 1
                  };
                  break;
                case '2':
                  _imagemagick2.default.crop({
                    srcPath: outputPath,
                    dstPath: outputPath.replace(/images_/, 'images_background_'),
                    width: 774,
                    height: 324,
                    quality: 1,
                    gravity: "Center"
                  }, function (err, stdout, stderr) {
                    if (err) throw err;
                  });

                  imageJSON = {
                    original: '/upload/images_' + timestamp + format,
                    background: '/upload/images_background_' + timestamp + format,
                    processing_type: 2
                  };
                  break;
                case '3':
                  _imagemagick2.default.crop({
                    srcPath: outputPath,
                    dstPath: outputPath.replace(/images_/, 'images_thumbnail_'),
                    width: 400,
                    height: 400,
                    quality: 1,
                    gravity: "Center"
                  }, function (err, stdout, stderr) {
                    if (err) throw err;
                  });
                  _imagemagick2.default.crop({
                    srcPath: outputPath,
                    dstPath: outputPath.replace(/images_/, 'images_background_'),
                    width: 774,
                    height: 324,
                    quality: 1,
                    gravity: "Center"
                  }, function (err, stdout, stderr) {
                    if (err) throw err;
                  });

                  imageJSON = {
                    original: '/upload/images_' + timestamp + format,
                    thumbnail: '/upload/images_thumbnail_' + timestamp + format,
                    background: '/upload/images_background_' + timestamp + format,
                    processing_type: 3
                  };
                  break;
                default:
                  imageJSON = {
                    original: '/upload/images_' + timestamp + format,
                    processing_type: 0
                  };
                  break;
              }

              var dateStr = _momentTimezone2.default.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

              imageJSON.created_at = dateStr;
              imageJSON.updated_at = dateStr;

              cb(null, imageJSON);
            }
          });
        })();
      } else {
        _fs2.default.unlink(path, function (err) {
          if (err) {
            return cb(err);
          } else {
            throw new Error('올바른 이미지가 아닙니다.');
          }
        });
      }
    }, function (imageJSON, cb) {
      _models2.default.images.create(imageJSON).then(function (image) {
        if (_url2.default.parse(req.url, true).query.processing_type) {
          cb(null, image);
        } else {
          cb(null, 'redirect');
        }
      }).catch(function (err) {
        return next(err, req, res, next);
      });
    }], function (err, result) {
      if (err) {
        return next(err, req, res, next);
      } else {
        if (typeof result !== 'string') {
          return res.send(result);
        } else if (result === 'redirect') {
          return res.redirect('/images');
        }
      }
    });
  });

  /*
    models.Image.forge({ original: req.body.original, thumbnail: req.body.original })
    .save()
    .then(function (image) {
      return res.redirect('/images');
    })
    .catch(function (err) {
      return next(err, req, res, next);
    });
  */
});

// Fetch Image
router.get('/:id', isAuthor, function (req, res, next) {
  _models2.default.images.findById(req.params.id).then(function (image) {
    if (!image) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      return res.render('images/show', _defineProperty({
        title: '이미지 조회',
        asset: 'images',
        mode: _config2.default.mode,
        url: 'http://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null
      }, 'image', image));
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Form for Delete Image
router.get('/delete/:id', isAuthor, function (req, res, next) {
  _models2.default.images.findById(req.params.id).then(function (image) {
    if (!image) {
      return res.status(404).render('404', { title: '404: Page Not Found.' });
    } else {
      return res.render('images/delete', _defineProperty({
        title: '이미지 삭제',
        asset: 'images',
        mode: _config2.default.mode,
        url: 'http://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null
      }, 'image', image));
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

// Delete Image
router.delete('/delete/:id', isAuthor, function (req, res, next) {
  _models2.default.imaegs.delete({
    where: { id: req.params.id }
  }).then(function (result) {
    if (result) {
      return res.redirect('/images');
    } else {
      throw new Error('존재하지 않는 이미지입니다.');
    }
  }).catch(function (err) {
    return next(err, req, res, next);
  });
});

module.exports = router;