var bodyParser = require('body-parser');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var dust = require('express-dustjs');
var express = require('express');
var logger = require('morgan');
var manifest = require('../package.json');
var minifyHTML = require('express-minify-html');
var path = require('path');

var user = require('./routes/user');
var whiteboard = require('./routes/whiteboard');

var app = express();

var production = app.get('env') === 'production';

// Dustjs settings
dust._.optimizers.format = function (ctx, node) {
  return node;
};

// view engine setup
app.engine('dust', dust.engine({
  // Use dustjs-helpers
  useHelpers: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'dust');

app.locals.production = production;
app.locals.version = manifest.version;

if (production) {
  app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      minifyJS: false,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true
    }
  }));
}

app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../dist')));

app.use('/', whiteboard);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  if (err.status === 404) {
    res.render('404');
  } else {
    res.render('error');
  }
});

module.exports = app;