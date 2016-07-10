// process.env.NODE_ENV = 'production';
process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

/* Express JS */
import express from 'express';

/* Basic Modules */
import favicon from 'serve-favicon';

import path from 'path';
import logger from 'morgan';

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
import images from './routes/images';
import join from './routes/join';
import usersAPI from './routes/api/users';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../dist')));

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
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}

// port setup
if (process.env.NODE_ENV !== 'development') {
  app.set('port', process.env.PORT || config.port);
}

/////////////////////////////////
// ------- creates Server -------

const server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;
