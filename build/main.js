'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('../config/config.json');

var _config2 = _interopRequireDefault(_config);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _connectRedis = require('connect-redis');

var _connectRedis2 = _interopRequireDefault(_connectRedis);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieSession = require('cookie-session');

var _cookieSession2 = _interopRequireDefault(_cookieSession);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportLocal = require('passport-local');

var _passportLocal2 = _interopRequireDefault(_passportLocal);

var _mailer = require('./mailer');

var _mailer2 = _interopRequireDefault(_mailer);

var _methodOverride = require('method-override');

var _methodOverride2 = _interopRequireDefault(_methodOverride);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _connectFlash = require('connect-flash');

var _connectFlash2 = _interopRequireDefault(_connectFlash);

var _index = require('./routes/index');

var _index2 = _interopRequireDefault(_index);

var _login = require('./routes/login');

var _login2 = _interopRequireDefault(_login);

var _logout = require('./routes/logout');

var _logout2 = _interopRequireDefault(_logout);

var _users = require('./routes/users');

var _users2 = _interopRequireDefault(_users);

var _categories = require('./routes/categories');

var _categories2 = _interopRequireDefault(_categories);

var _posts = require('./routes/posts');

var _posts2 = _interopRequireDefault(_posts);

var _comments = require('./routes/comments');

var _comments2 = _interopRequireDefault(_comments);

var _photos = require('./routes/photos');

var _photos2 = _interopRequireDefault(_photos);

var _portfolio = require('./routes/portfolio');

var _portfolio2 = _interopRequireDefault(_portfolio);

var _works = require('./routes/works');

var _works2 = _interopRequireDefault(_works);

var _resume = require('./routes/resume');

var _resume2 = _interopRequireDefault(_resume);

var _images = require('./routes/images');

var _images2 = _interopRequireDefault(_images);

var _join = require('./routes/join');

var _join2 = _interopRequireDefault(_join);

var _users3 = require('./routes/api/users');

var _users4 = _interopRequireDefault(_users3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* for Session */


/* Express JS */


var RedisStore = (0, _connectRedis2.default)(_expressSession2.default);
// import formidable from 'formidable';


/* Configuration */


/* Basic Modules */
// process.env.NODE_ENV = 'production';
// process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

/* Express JS */

var LocalStrategy = _passportLocal2.default.Strategy;

/* Node Mailer */


/* Override Form Method */


/* Image Upload */

var upload = (0, _multer2.default)({ dest: '../public/images' });

/* Data Base */
// import models from '../db/models';
// import collections from '../db/collections';

/* Flash */


/* Routes */


var options = {
  key: _fs2.default.readFileSync(_path2.default.join(__dirname, '../config/privkey1.pem')),
  cert: _fs2.default.readFileSync(_path2.default.join(__dirname, '../config/cert1.pem'))
};

var app = (0, _express2.default)();

// view engine setup
app.set('views', _path2.default.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use((0, _serveFavicon2.default)(_path2.default.join(__dirname, '../public', 'favicon.ico')));
app.use(_express2.default.static(_path2.default.join(__dirname, '../public')));
app.use(_express2.default.static(_path2.default.join(__dirname, '../dist')));

app.use((0, _morgan2.default)('dev'));

app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));

var client = _redis2.default.createClient();

app.use((0, _cookieParser2.default)());
app.use((0, _expressSession2.default)({
  store: new RedisStore({ host: _config2.default.redis.host, port: _config2.default.redis.port, client: client }),
  key: _config2.default.session.key,
  secret: _config2.default.session.secret,
  cookie: {
    maxAge: 1000 * 60 * 60
  },
  saveUninitialized: false,
  resave: false
}));

app.use(_passport2.default.initialize());
app.use(_passport2.default.session());

app.use((0, _connectFlash2.default)());

app.use((0, _methodOverride2.default)('_method'));

app.use('/', _index2.default);
app.use('/login', _login2.default);
app.use('/logout', _logout2.default);
app.use('/users', _users2.default);
app.use('/categories', _categories2.default);
app.use('/posts', _posts2.default);
app.use('/comments', _comments2.default);
app.use('/photos', _photos2.default);
app.use('/portfolio', _portfolio2.default);
app.use('/works', _works2.default);
app.use('/resume', _resume2.default);
app.use('/images', _images2.default);
app.use('/join', _join2.default);
// app.use('/api/users', usersAPI);

/***** robots.txt *****/
app.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /photos');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// if (app.get('env') === 'development') {
if (_config2.default.mode !== 'development') {
  // development error handler
  // will print stacktrace
  app.use(function (err, req, res, next) {
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
  app.use(function (err, req, res, next) {
    var url = req.url;
    var method = req.method;
    var userAgent = req.headers['user-agent'];
    var userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var queryString = JSON.stringify(req.query);
    var currentTime = new Date();

    var mailOptions = {
      from: 'jaewon < yocee57@gmail.com >',
      to: 'yocee57@gmail.com', // ',' 로 받는 사람 구분
      subject: '[Server Error] ' + currentTime,
      html: '===============================<br />ERROR<br />===============================<br />' + err.message.replace(/\n/g, '<br />') + '<br /><br />===============================<br />ENVIRONMENT<br />===============================<br />' + '* URL : ' + url + '<br />' + '* METHOD : ' + method + '<br />' + '* USER AGENT : ' + userAgent + '<br />' + '* USER IP : ' + userIP + '<br />' + '* QUERY STRING : ' + queryString
    };

    res.status(err.status || 500);
    res.render('500', {
      message: err.message,
      error: {}
    });

    return _mailer2.default.sendMail(mailOptions, function (err, res) {
      if (err) {
        console.log('failed... => ' + err);
      } else {
        console.log('succeed... => ' + res);
      }

      _mailer2.default.close();
    });
  });
}

// port setup
if (_config2.default.mode !== 'development') {
  app.set('port', process.env.PORT || _config2.default.port);
}

/////////////////////////////////
// ------- creates Server -------

/*
const server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});

const httpsServer = app.listen(app.get('httpsPort'), function () {
  console.log('https server listening on port ' + httpsServer.address().port);
});
*/

module.exports = app;