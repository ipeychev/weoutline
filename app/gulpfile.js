var ExtractTextPlugin = require('extract-text-webpack-plugin');
var del = require('del');
var glob = require('glob');
var gulp = require('gulp');
var gutil = require('gutil');
var isparta = require('isparta');
var loadPlugins = require('gulp-load-plugins');
var path = require('path');
var runSequence = require('run-sequence');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');

var Instrumenter = isparta.Instrumenter;
var mochaGlobals = require('./test/setup/.globals');
var manifest = require('./package.json');

var release = process.env.NODE_ENV === 'production';

// Load all of our Gulp plugins
var $ = loadPlugins();

var destinationFolder = 'dist';

function cleanDist(done) {
  del([destinationFolder]).then(() => done());
}

function cleanTmp(done) {
  del(['tmp']).then(() => done());
}

// Lint a set of files
function lint(files) {
  return gulp.src(files)
    .pipe($.eslint())
    .pipe($.eslint.format());
}

function lintSrc() {
  return lint('src/**/*.js');
}

function lintTest() {
  return lint('test/**/*.js');
}

function lintGulpfile() {
  return lint('gulpfile.js');
}

function build(done) {
  runSequence(
    'clean',
    'build-src',
    ['lint'],
    'copy-static',
    done
  );
}

function buildSrc(callback) {
  let plugins = [
    new webpack.optimize.CommonsChunkPlugin({
        name: 'commons',
        filename: `commons.${manifest.version}${release ? '.min': ''}.js`
    }),
    new ExtractTextPlugin(`[name].${manifest.version}${release ? '.min': ''}.css`, {allChunks: true})
  ];

  if (release) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
  }

  webpack({
    entry: {
      'user-profile': './src/pages/user-profile.js',
      'user-sign-in': './src/pages/user-sign-in.js',
      'whiteboard': './src/pages/whiteboard.js'
    },
    output: {
      chunkFilename: `[id].js`,
      filename: `[name].${manifest.version}${release ? '.min': ''}.js`,
      path: destinationFolder
    },
    module: {
      context: path.join(__dirname, 'node_modules'),
      loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            presets: ['es2015']
          },
          {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader')
          }
        ]
    },
    devtool: release ? '' : 'source-map',
    plugins: plugins
  }, function (err) {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }

    callback();
  });
}

function copyStatic() {
  return gulp.src([
      'src/**/assets/vendor/**/*.css',
      'src/**/*.jpeg',
      'src/**/*.png',
      'src/**/*.svg'
    ])
    .pipe(gulp.dest(destinationFolder));
}

function coverage(done) {
  _registerBabel();
  gulp.src(['src/**/*.js', '!**/server.js', '!**/views', '!**/routes'])
    .pipe($.istanbul({
      instrumenter: Instrumenter,
      includeUntested: true
    }))
    .pipe($.istanbul.hookRequire())
    .on('finish', () => {
      return test()
        .pipe($.istanbul.writeReports())
        .on('end', done);
    });
}

function cleanDist(done) {
  del([destinationFolder]).then(() => done());
}

function _mocha() {
  return gulp.src(['test/setup/node.js', 'test/unit/**/*.js'], {read: false})
    .pipe($.mocha({
      reporter: 'dot',
      globals: Object.keys(mochaGlobals.globals),
      ignoreLeaks: false
    }));
}

function _registerBabel() {
  require('babel-register');
}

function test() {
  _registerBabel();
  return _mocha();
}

var watchFiles = ['src/**/*', 'test/**/*', 'package.json', '**/.eslintrc', '!**/server.js', '!**/views/*', '!**/routes/*'];

// Run the headless unit tests as you make changes.
function watch() {
  gulp.watch(watchFiles, ['build']);
}

function testBrowser() {
  // Our testing bundle is made up of our unit tests, which
  // should individually load up pieces of our application.
  // We also include the browser setup file.
  var testFiles = glob.sync('./test/unit/**/*.js');
  var allFiles = ['./test/setup/browser.js'].concat(testFiles);

  // vars us differentiate between the first build and subsequent builds
  var firstBuild = true;

  // This empty stream might seem like a hack, but we need to specify all of our files through
  // the `entry` option of webpack. Otherwise, it ignores whatever file(s) are placed in here.
  return gulp.src('')
    .pipe($.plumber())
    .pipe(webpackStream({
      watch: true,
      entry: allFiles,
      output: {
        filename: '__spec-build.js'
      },
      // Externals isn't necessary here since these are for tests.
      module: {
        loaders: [
          // This is what allows us to author in future JavaScript
          {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
          // This allows the test setup scripts to load `package.json`
          {test: /\.json$/, exclude: /node_modules/, loader: 'json-loader'}
        ]
      },
      plugins: [
        // By default, webpack does `n=>n` compilation with entry files. This concatenates
        // them into a single chunk.
        new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})
      ],
      devtool: 'inline-source-map'
    }, null, () => {
      if (firstBuild) {
        $.livereload.listen({port: 35729, host: 'localhost', start: true});
        gulp.watch(watchFiles, ['lint']);
      } else {
        $.livereload.reload('./tmp/__spec-build.js');
      }
      firstBuild = false;
    }))
    .pipe(gulp.dest('./tmp'));
}

// Remove the built files
gulp.task('clean', cleanDist);

// Remove our temporary files
gulp.task('clean-tmp', cleanTmp);

// Lint our source code
gulp.task('lint-src', lintSrc);

// Lint our test code
gulp.task('lint-test', lintTest);

// Lint this file
gulp.task('lint-gulpfile', lintGulpfile);

// Lint everything
gulp.task('lint', ['lint-src', 'lint-test', 'lint-gulpfile']);

// Build two versions of the library
gulp.task('build', build);

// Build the src files
gulp.task('build-src', buildSrc);

gulp.task('copy-static', copyStatic);

// Lint and run our tests
gulp.task('test', ['lint'], test);

// Set up coverage and run tests
gulp.task('coverage', ['lint'], coverage);

// Set up a livereload environment for our spec runner `test/runner.html`
gulp.task('test-browser', ['lint', 'clean-tmp'], testBrowser);

// Run the headless unit tests as you make changes.
gulp.task('watch', ['build'], watch);

// An alias of test
gulp.task('default', ['test']);
