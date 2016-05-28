var express = require('express');
var router = express.Router();

var url = require('url');

router.get('/', function (req, res, next) {
  res.render('photos/index',
      {
        req: req,
        title: 'Jaewonism',
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s photo'.substring(0, 255),
        keyword: 'blog, photo, instagram, 블록, 사진, 인스타그램, jaewonism',
        userId: req.user ? req.user.user_id : null
      }
  );
});

module.exports = router;

