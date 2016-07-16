import express from 'express';

import url from 'url';
import formidable from 'formidable';
import fs from 'fs';
import im from 'imagemagick';

import models from '../../db/models';
import collections from '../../db/collections';

import config from '../../config/config.json';

const router = express.Router();

let isAuthor;
let userId;

isAuthor = (req, res, next) => {
  if (req.user) {
    models.User.forge({ user_id: req.user.user_id })
    .fetch()
    .then((user) => {
      if ((user.toJSON().level >> 0) === 99) {
        userId = user.toJSON().id;
        next();
      } else {
        req.flash('info', '포스트 작성 권한이 없습니다.');
        res.redirect('/posts');
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.' });
    });
  } else {
    req.flash('info', '포스트를 작성하려면 로그인을 해야합니다.');
    res.redirect('/login');
  }
};

// Fetch all Images
router.get('/', isAuthor, (req, res, next) => {
  collections.Images.forge()
  .fetch()
  .then((collection) => {
    res.render('images/index',
        {
          title: '이미지 리스트',
          asset: 'images',
          mode: config.mode,
          url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
          image: req.protocol + '://' + req.headers.host + '/images/logo.png',
          description: 'Jaewonism\'s blog'.substring(0, 255),
          keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
          userId: req.user ? req.user.user_id : null,
          images: collection.toJSON()
        }
    );
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form to Create Image
router.get('/new', isAuthor, (req, res, next) => {
  res.render('images/new',
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

    if (url.parse(req.url, true).query.processing_type >> 0) {
      imageFile = files.file;
    }

    if (imageFile) {
      let name = imageFile.name || '' + +new Date();
      let path = imageFile.path;
      let type = imageFile.type;
      let format;

      if (url.parse(req.url, true).query.file_type) {
        format = url.parse(req.url, true).query.file_type;
      } else {
        format = name.match(/\.\w{1,5}/g)[name.match(/\.\w{1,5}/g).length - 1];
      }

      if (type.indexOf('image') != -1 || url.parse(req.url, true).query.file_type) {
        let outputPath = __dirname + '/public/upload/' + 'images_' + timestamp + format;
        outputPath = outputPath.replace(/routes\//, '').replace(/build\//, '');

        fs.rename(path, outputPath, (err) => {
          if (err) {
            console.log(err);
            res.render('500', { title: '500: Internal Server Error.'});
          } else {
            let processingType = fields.processing_type;
            let imageJSON = {};

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
            models.Image.forge(imageJSON)
            .save()
            .then((image) => {
              if (url.parse(req.url, true).query.processing_type >> 0) {
                res.json(image);
              } else {
                res.redirect('/images');
              }
            })
            .catch((err) => {
              console.log(err.message);
              res.render('500', { title: '500: Internal Server Error.'});
            });
          }
        });
      } else {
        fs.unlink(path, (error) => {
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
router.get('/:id', isAuthor, (req, res, next) => {
  models.Image.forge({ id: req.params.id })
  .fetch()
  .then((image) => {
    if (!image) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('images/show',
          {
            title: '이미지 조회',
            asset: 'images',
            mode: config.mode,
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
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Form for Delete Image
router.get('/delete/:id', isAuthor, (req, res, next) => {
  models.Image.forge({ id: req.params.id })
  .fetch()
  .then((image) => {
    if (!image) {
      res.render('404', { title: '404: Page Not Found.'});
    } else {
      res.render('images/delete',
          {
            title: '이미지 삭제',
            asset: 'images',
            mode: config.mode,
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
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

// Delete Image
router.delete('/delete/:id', isAuthor, (req, res, next) => {
  models.Image.forge({ id: req.params.id })
  .fetch({ require: true })
  .then((image) => {
    image.destroy()
    .then(() => {
      res.redirect('/images');
    })
    .catch((err) => {
      console.log(err.message);
      res.render('500', { title: '500: Internal Server Error.'});
    });
  })
  .catch((err) => {
    console.log(err.message);
    res.render('500', { title: '500: Internal Server Error.'});
  });
});

module.exports = router;

