import express from 'express';

import async from 'async';
import url from 'url';
import formidable from 'formidable';
import fs from 'fs';
import im from 'imagemagick';
import moment from 'moment-timezone';

import models from '../../models';

import config from '../../config/config.json';

const router = express.Router();

let isAuthor;
let userId;

isAuthor = (req, res, next) => {
  if (req.user) {
    models.users
      .findById(req.user.id)
      .then((user) => {
        if (+user.level === 99) {
          userId = user.toJSON().id;
          return next();
        } else {
          req.flash('info', '포스트 작성 권한이 없습니다.');
          return res.redirect('/posts');
        }
      })
      .catch((err) => {
        return next(err, req, res, next);
      });
  } else {
    req.flash('info', '로그인을 해주세요.');
    return res.redirect('/login');
  }
};

// Fetch all Images
router.get('/', isAuthor, (req, res, next) => {
  models.images
    .findAll()
    .then((images) => {
      return res.render('images/index',
          {
            title: '이미지 리스트',
            asset: 'images',
            mode: config.mode,
            url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
            image: req.protocol + '://' + req.headers.host + '/images/logo.png',
            description: 'Jaewonism\'s blog'.substring(0, 255),
            keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
            userId: req.user ? req.user.user_id : null,
            images: images
          }
      );
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Form to Create Image
router.get('/new', isAuthor, (req, res, next) => {
  return res.render('images/new',
      {
        title: '이미지 등록',
        asset: 'images',
        mode: config.mode,
        url: 'http://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s blog'.substring(0, 255),
        keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
        userId: req.user ? req.user.user_id : null
      }
  );
});

// Create Image
router.post('/new', isAuthor, (req, res, next) => {
  let form = new formidable.IncomingForm();
  let files = [];
  let fields = [];

  form.keepExtensions = true;
  form.uploadDir = __dirname + '/public/upload';
  form.uploadDir = form.uploadDir.replace(/routes\//, '').replace(/build\//, '');
  form.maxFieldsSize = 10 * 1024 * 1024;

  form.on('fileBegin', (name,file) => { }).on('progress', (bytesReceived, bytesExpected) => { })
  .on('aborted', () => { }).on('error', (e) => { console.log('error!!', e); }).on('end', () => { });

  form.parse(req, (err, fields, files) => {
    let timestamp = Date.now();
    let imageFile = files.original;

    async.waterfall([
      (cb) => {
        if (+url.parse(req.url, true).query.processing_type) {
          imageFile = files.file;
          cb(null, imageFile);
        } else {
          throw new Error('Invalid Processing Type');
        }
      }, (imageFile, cb) => {
        let name = imageFile.name || '' + +new Date();
        let path = imageFile.path;
        let type = imageFile.type;
        let format;

        if (url.parse(req.url, true).query.file_type) {
          format = url.parse(req.url, true).query.file_type;
        } else {
          format = name.match(/\.\w{1,5}/g)[name.match(/\.\w{1,5}/g).length - 1];
        }

        if (type.indexOf('image') !== -1 || url.parse(req.url, true).query.file_type) {
          let outputPath = __dirname + '/public/upload/' + 'images_' + timestamp + format;
          outputPath = outputPath.replace(/routes\/|build\//g, '');

          fs.rename(path, outputPath, (err) => {
            if (err) {
              return next(err, req, res, next);
            } else {
              let processingType = fields.processing_type;
              let imageJSON = {};

              if (+url.parse(req.url, true).query.processing_type === 2) {
                processingType = '2';
              } else if (+url.parse(req.url, true).query.processing_type === 1) {
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
                  }, (err, stdout, stderr) => {
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
                  }, (err, stdout, stderr) => {
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
                  }, (err, stdout, stderr) => {
                    if (err) throw err;
                  });
                  im.crop({
                      srcPath: outputPath,
                      dstPath: outputPath.replace(/images_/, 'images_background_'),
                      width: 774,
                      height: 324,
                      quality: 1,
                      gravity: "Center"
                  }, (err, stdout, stderr)  => {
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

              let dateStr = moment.tz(new Date(), 'Asia/Seoul').format().replace(/\+.+/, '');

              imageJSON.created_at = dateStr;
              imageJSON.updated_at = dateStr;

              cb(null, imageJSON);
            }
          });
        } else {
          fs.unlink(path, (err) => {
            if (err) {
              return cb(err);
            } else {
              throw new Error('올바른 이미지가 아닙니다.');
            }
          });
        }
      }, (imageJSON, cb) => {
        models.images
          .create(imageJSON)
          .then((image) => {
            if (url.parse(req.url, true).query.processing_type) {
              cb(null, image);
            } else {
              cb(null, 'redirect');
            }
          })
          .catch((err) => {
            return next(err, req, res, next);
          });
      }
    ], (err, result) => {
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
router.get('/:id', isAuthor, (req, res, next) => {
  models.images
    .findById(req.params.id)
    .then((image) => {
      if (!image) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        return res.render('images/show',
            {
              title: '이미지 조회',
              asset: 'images',
              mode: config.mode,
              url: 'http://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/logo.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              image: image
            }
        );
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Form for Delete Image
router.get('/delete/:id', isAuthor, (req, res, next) => {
  models.images
    .findById(req.params.id)
    .then((image) => {
      if (!image) {
        return res.status(404).render('404', { title: '404: Page Not Found.'});
      } else {
        return res.render('images/delete',
            {
              title: '이미지 삭제',
              asset: 'images',
              mode: config.mode,
              url: 'http://' + req.headers.host + req.baseUrl + req.url,
              image: req.protocol + '://' + req.headers.host + '/images/logo.png',
              description: 'Jaewonism\'s blog'.substring(0, 255),
              keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
              userId: req.user ? req.user.user_id : null,
              image: image
            }
        );
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

// Delete Image
router.delete('/delete/:id', isAuthor, (req, res, next) => {
  models.imaegs
    .delete({
      where: { id: req.params.id }
    })
    .then((result) => {
      if (result) {
        return res.redirect('/images');
      } else {
        throw new Error('존재하지 않는 이미지입니다.');
      }
    })
    .catch((err) => {
      return next(err, req, res, next);
    });
});

module.exports = router;

