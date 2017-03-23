let bodyParser = require('body-parser');
let compression = require('compression');
let cookieParser = require('cookie-parser');
let dust = require('express-dustjs');
let express = require('express');
let logger = require('morgan');
let manifest = require('../package.json');
let minifyHTML = require('express-minify-html');
let path = require('path');

let routeMap = require('./routes/route-map');
let user = require('./routes/user');
let whiteboard = require('./routes/whiteboard');

let app = express();

let production = app.get('env') === 'production';

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
app.locals.routeMap = routeMap;
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
  let err = new Error('Not Found');
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