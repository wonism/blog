import express from 'express';

import url from 'url';

import config from '../../config/config.json';

const router = express.Router();

router.get('/', (req, res, next) => {
  return res.render('photos/index',
      {
        title: 'Jaewonism',
        asset: 'photos',
        mode: config.mode,
        url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
        image: req.protocol + '://' + req.headers.host + '/images/logo.png',
        description: 'Jaewonism\'s photo'.substring(0, 255),
        keyword: 'blog, photo, instagram, 블록, 사진, 인스타그램, jaewonism',
        userId: req.user ? req.user.user_id : null
      }
  );
});

module.exports = router;

