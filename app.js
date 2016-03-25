// process.env.NODE_ENV = 'production';
process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

var express = require('express');

var favicon = require('serve-favicon');

var path = require('path');
var logger = require('morgan');

/* for Session */
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var cookieSession = require('cookie-session');
var sessionOptions = require('./config/session');
var portNumber = require('./config/port');

/* for Form Method */
var methodOverride = require('method-override');

/* for Image Upload */
var multer = require('multer');
var upload = multer({ dest: './public/images' });

/* I DONT KNOW */
var _ = require('lodash');

/* for Data Base */
var models = require('./db/models');
var collections = require('./db/collections');

/* for Flash */
var flash = require('connect-flash');

/* for Routes */
var routes = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var users = require('./routes/users');
var categories = require('./routes/categories');
var posts = require('./routes/posts');
var comments = require('./routes/comments');
var photos = require('./routes/photos');
var portfolio = require('./routes/portfolio');
var images = require('./routes/images');
var join = require('./routes/join');
var usersAPI = require('./routes/api/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
  // store: new RedisStore(),
  key: sessionOptions.sessionKey,
  secret: sessionOptions.sessionSecret,
  cookie: {
    maxAge: 1000 * 60 * 60
  },
  saveUninitialized: true
}));

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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// port setup
if (process.env.NODE_ENV !== 'development') {
  app.set('port', process.env.PORT || portNumber);
}

//////////////////////////////////////////////////////
// ------- creates Server -------

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;

