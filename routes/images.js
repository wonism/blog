var express = require('express');
var router = express.Router();

var url = require('url');

var formidable = require('formidable');
var fs = require('fs');

var pool = require('../config/dbconfig');
var orm = require('sequelize');

var models = require('../db/models');
var collections = require('../db/collections');

var im = require('imagemagick');

isAuthor = function (req, res, next) {
  if (req.user) {
    models.User.forge({ user_id: req.user.user_id })
    .fetch()
    .then(function (user) {
      if ((user.toJSON().level >> 0) === 99) {
        userPk = user.toJSON().id;
        next();
      } else {
        req.flash('info', '포스트 작성 권한이 없습니다.');
        res.redirect('/posts');
      }
    })
    .catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  } else {
    req.flash('info', '포스트를 작성하려면 로그인을 해야합니다.');
    res.redirect('/login');
  }
};

// Fetch all Images
router.get('/', isAuthor, function (req, res, next) {
  collections.Images.forge()
  .fetch()
  .then(function (collection) {
    res.render('images/index',
        {
          req: req,
          title: '이미지 리스트',
          url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
          image: req.protocol + '://' + req.headers.host + '/images/logo.png',
          description: 'Jaewonism\'s blog'.substring(0, 255),
          keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
          userId: req.user ? req.user.user_id : null,
          images: collection.toJSON()
        }
    );
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form to Create Image
router.get('/new', isAuthor, function (req, res, next) {
  res.render('images/new',
      {
        req: req,
        title: '이미지 등록',
        url: 'http://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null
      }
  );
});

// Create Image
router.post('/new', isAuthor, function (req, res, next) {
  var form = new formidable.IncomingForm();
  var files = [];
  var fields = [];

  form.keepExtensions = true;
  form.uploadDir = __dirname + '/public/upload';
  form.uploadDir = form.uploadDir.replace(/routes\//, '');
  form.maxFieldsSize = 10 * 1024 * 1024;

  form.on('fileBegin', function (name,file) { }).on('progress', function (bytesReceived, bytesExpected) { })
  .on('aborted', function () { }).on('error', function (e) { console.log('error!!', e); }).on('end', function () { });

  form.parse(req, function (err, fields, files) {
    var timestamp = Date.now();
    var imageFile = files.original;

    if (url.parse(req.url, true).query.processing_type >> 0) {
      imageFile = files.file;
    }

    if (imageFile) {
      var name = imageFile.name || '' + +new Date();
      var path = imageFile.path;
      var type = imageFile.type;
      var format;

      if (url.parse(req.url, true).query.file_type) {
        format = url.parse(req.url, true).query.file_type;
      } else {
        format = name.match(/\.\w{1,5}/g)[name.match(/\.\w{1,5}/g).length - 1];
      }

      if (type.indexOf('image') != -1 || url.parse(req.url, true).query.file_type) {
        var outputPath = __dirname + '/public/upload/' + 'images_' + timestamp + format;
        outputPath = outputPath.replace(/routes\//, '');

        fs.rename(path, outputPath, function (err) {
          if (err) {
            console.log(err);
            res.render('500', { title: '500: Internal Server Error.'});
          } else {
            var processingType = fields.processing_type;
            var imageJSON = {};

            if (url.parse(req.url, true).query.processing_type >> 0 === 2) {
              processingType = '2';
            } else if (url.parse(req.url, true).query.processing_type >> 0 === 1) {
              processingType = '1';
            }

            switch (processingType) {
              case '1':
                im.crop({
                    srcPath: outputPath,
                    dstPath: outputPath.replace(/images_/, 'images_thumbnail_'),
                    width: 400,
                    height: 400,
                    quality: 1,
                    gravity: "Center"
                }, function (err, stdout, stderr){
                  if (err) throw err;
                });

                imageJSON = {
                    original: '/upload/images_' + timestamp + format,
                    thumbnail: '/upload/images_thumbnail_' + timestamp + format,
                    processing_type: 1
                };
                break;
              case '2':
                im.crop({
                    srcPath: outputPath,
                    dstPath: outputPath.replace(/images_/, 'images_background_'),
                    width: 774,
                    height: 324,
                    quality: 1,
                    gravity: "Center"
                }, function (err, stdout, stderr){
                  if (err) throw err;
                });

                imageJSON = {
                    original: '/upload/images_' + timestamp + format,
                    background: '/upload/images_background_' + timestamp + format,
                    processing_type: 2
                };
                break;
              case '3':
                im.crop({
                    srcPath: outputPath,
                    dstPath: outputPath.replace(/images_/, 'images_thumbnail_'),
                    width: 400,
                    height: 400,
                    quality: 1,
                    gravity: "Center"
                }, function (err, stdout, stderr){
                  if (err) throw err;
                });
                im.crop({
                    srcPath: outputPath,
                    dstPath: outputPath.replace(/images_/, 'images_background_'),
                    width: 774,
                    height: 324,
                    quality: 1,
                    gravity: "Center"
                }, function (err, stdout, stderr){
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
            models.Image.forge(imageJSON)
            .save()
            .then(function (image) {
              if (url.parse(req.url, true).query.processing_type >> 0) {
                res.json(image);
              } else {
                res.redirect('/images');
              }
            })
            .catch(function (err) {
              console.log(err.message);
              res.render('500', { title: '500: Internal Server Error.'});
            });
          }
        });
      } else {
        fs.unlink(path, function (error) {
          res.send(400);
        });
      }
    } else {
      res.send(404);
    }
  });

/*
  models.Image.forge({ original: req.body.original, thumbnail: req.body.original })
  .save()
  .then(function (image) {
    res.redirect('/images');
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
*/
});

// Fetch Image
router.get('/:id', isAuthor, function (req, res, next) {
  models.Image.forge({ id: req.params.id })
  .fetch()
  .then(function (image) {
    if (!image) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('images/show',
          {
            req: req,
            title: '이미지 조회',
            url: 'http://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            image: image.toJSON()
          }
      );
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form for Delete Image
router.get('/delete/:id', isAuthor, function (req, res, next) {
  models.Image.forge({ id: req.params.id })
  .fetch()
  .then(function (image) {
    if (!image) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('images/delete',
          {
            req: req,
            title: '이미지 삭제',
            url: 'http://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            image: image.toJSON()
          }
      );
    }
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Delete Image
router.delete('/delete/:id', isAuthor, function (req, res, next) {
  models.Image.forge({ id: req.params.id })
  .fetch({ require: true })
  .then(function (image) {
    image.destroy()
    .then(function () {
      res.redirect('/images');
    })
    .catch(function (err) {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.'});
    });
  })
  .catch(function (err) {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

module.exports = router;

