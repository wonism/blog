// process.env.NODE_ENV = 'production';
// process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

/* Express JS */
import express from 'express';

/* Express JS */
import https from 'https';

/* Basic Modules */
import favicon from 'serve-favicon';

import path from 'path';
import logger from 'morgan';

import fs from 'fs';

/* Configuration */
import config from '../config/config.json';

/* for Session */
import session from 'express-session';
import redis from 'redis';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import formidable from 'formidable';
import cookieSession from 'cookie-session';
import passport from 'passport';
import passportLocal from 'passport-local';

let RedisStore = connectRedis(session);
let LocalStrategy = passportLocal.Strategy;

/* Node Mailer */
import mailer from './mailer';

/* Override Form Method */
import methodOverride from 'method-override';

/* Image Upload */
import multer from 'multer';
let upload = multer({ dest: '../public/images' });

/* Data Base */
import models from '../db/models';
import collections from '../db/collections';

/* Flash */
import flash from 'connect-flash';

/* Routes */
import routes from './routes/index';
import login from './routes/login';
import logout from './routes/logout';
import users from './routes/users';
import categories from './routes/categories';
import posts from './routes/posts';
import comments from './routes/comments';
import photos from './routes/photos';
import portfolio from './routes/portfolio';
import resume from './routes/resume';
import images from './routes/images';
import join from './routes/join';
import usersAPI from './routes/api/users';

const options = {
  key: fs.readFileSync(path.join(__dirname, '../config/privkey1.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../config/cert1.pem'))
};

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, '../public')));
if (config.mode === 'development') {
  app.use(express.static(path.join(__dirname, '../src')));
} else {
  app.use(express.static(path.join(__dirname, '../dist')));
}

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let client = redis.createClient();

app.use(cookieParser());
app.use(session({
  store: new RedisStore({ host: config.redis.host, port: config.redis.port, client: client }),
  key: config.session.key,
  secret: config.session.secret,
  cookie: {
    maxAge: 1000 * 60 * 60
  },
  saveUninitialized: false,
  resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(methodOverride('_method'));

app.use('/', routes);
app.use('/login', login);
app.use('/logout', logout);
app.use('/users', users);
app.use('/categories', categories);
app.use('/posts', posts);
app.use('/comments', comments);
app.use('/photos', photos);
app.use('/portfolio', portfolio);
app.use('/resume', resume);
app.use('/images', images);
app.use('/join', join);
// app.use('/api/users', usersAPI);

/***** robots.txt *****/
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /photos');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
if (app.get('env') === 'development') {
  // development error handler
  // will print stacktrace
  app.use((err, req, res, next) => {
    console.log(err.message);

    res.status(err.status || 500);
    return res.render('500', {
      message: err.message,
      error: err
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res, next) => {
    let url = req.url;
    let method = req.method;
    let userAgent = req.headers['user-agent'];
    let userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let queryString = JSON.stringify(req.query);
    let currentTime = new Date();

    let mailOptions = {
      from: 'jaewon < yocee57@gmail.com >',
      to: 'yocee57@gmail.com', // ',' 로 받는 사람 구분
      subject: '[Server Error] ' + currentTime,
      html: '===============================<br />ERROR<br />===============================<br />' +
          err.message.replace(/\n/g, '<br />') +
          '<br /><br />===============================<br />ENVIRONMENT<br />===============================<br />' +
          '* URL : ' + url + '<br />' +
          '* METHOD : ' + method + '<br />' +
          '* USER AGENT : ' + userAgent + '<br />' +
          '* USER IP : ' + userIP + '<br />' +
          '* QUERY STRING : ' + queryString
    };

    res.status(err.status || 500);
    res.render('500', {
      message: err.message,
      error: {}
    });

    return mailer.sendMail(mailOptions, function (err, res) {
      if (err) {
        console.log('failed... => ' + err);
      } else {
        console.log('succeed... => ' + res);
      }

      mailer.close();
    });
  });
}

// port setup
if (config.mode !== 'development') {
  app.set('port', process.env.PORT || config.port);
}

/////////////////////////////////
// ------- creates Server -------

const server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});

const httpsServer = app.listen(app.get('httpsPort'), function () {
  console.log('https server listening on port ' + httpsServer.address().port);
});

module.exports = app;

