import express from 'express';

import url from 'url';

// import models from '../../models';

import config from '../../config/config.json';

const router = express.Router();

router.get('/', (req, res, next) => {
  return res.redirect('/works/selfie');
  /*
  return res.render('works/selfie_with_js', {
      title: 'Jaewonism',
      asset: 'works',
      mode: config.mode,
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/logo.png',
      description: 'Jaewonism\'s blog'.substring(0, 255),
      keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
      userId: req.user ? req.user.user_id : null,
      endPoint: 'root'
  });
  */
});

router.get('/selfie', (req, res, next) => {
  return res.render('works/selfie_with_js', {
      title: 'Jaewonism',
      asset: 'selfie',
      mode: config.mode,
      url: req.protocol + '://' + req.headers.host + req.baseUrl + req.url,
      image: req.protocol + '://' + req.headers.host + '/images/new_logo_black.png',
      description: 'Jaewonism\'s blog'.substring(0, 255),
      keyword: 'portfolio, Front End, 포트폴리오, 웹개발자, 프론트엔드, Java Script, Node JS, Ruby on Rails',
      userId: req.user ? req.user.user_id : null,
      endPoint: 'root'
  });
});

module.exports = router;

