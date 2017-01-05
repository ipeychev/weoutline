const concatCss = require('gulp-concat-css');
const cssmin = require('gulp-cssmin');
const del = require('del');
const glob = require('glob');
const gulp = require('gulp');
const htmlreplace = require('gulp-html-replace');
const isparta = require('isparta');
const loadPlugins = require('gulp-load-plugins');
const path = require('path');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const Instrumenter = isparta.Instrumenter;
const mochaGlobals = require('./test/setup/.globals');
const manifest = require('./package.json');

// Load all of our Gulp plugins
const $ = loadPlugins();

// Gather the library data from `package.json`
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const destinationFolder = path.dirname(mainFile);
const exportJSFileName = path.basename(mainFile, path.extname(mainFile));

let releaseBuild = false;

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
    ['lint', 'compile-sass'],
    'concat-css',
    'min-css',
    'clean-css',
    'copy-static',
    'update-index-file',
    done
  );
}

function buildSrc() {
  return gulp.src(path.join('src', config.entryFileName))
    .pipe(webpackStream({
      output: {
        filename: `${exportJSFileName}.${manifest.version}.js`,
        libraryTarget: 'umd',
        library: config.mainVarName
      },
      // Add your own externals here. For instance,
      // {
      //   jquery: true
      // }
      // would externalize the `jquery` module.
      externals: {},
      module: {
        loaders: [
          {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
      },
      devtool: 'source-map'
    }).on('error', errorHandler))
    .pipe(gulp.dest(destinationFolder))
    .pipe($.filter(['**', '!**/*.js.map']))
    .pipe($.rename(`${exportJSFileName}.${manifest.version}.min.js`))
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(destinationFolder));
}

function copyFonts() {
  return gulp.src('src/assets/vendor/fonts/*.*')
    .pipe(gulp.dest(destinationFolder + '/assets/fonts'));
}

function copyStatic() {
  return gulp.src([
      'src/index.html',
      'src/**/assets/vendor/**/*.css',
      'src/**/*.jpeg'
    ])
    .pipe(gulp.dest(destinationFolder));
}

function coverage(done) {
  _registerBabel();
  gulp.src(['src/**/*.js'])
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

function errorHandler(error) {
  console.log(error.toString());

  this.emit('end');
}

function cleanCSS(done) {
  del([
    path.join(destinationFolder, 'assets/**/*.css'),
    '!' + path.join(destinationFolder, `assets/app.${manifest.version}.css`),
    '!' + path.join(destinationFolder, `assets/app.${manifest.version}.min.css`),
    '!' + path.join(destinationFolder, 'assets/vendor')
  ])
  .then(() => done());
}

function cleanDist(done) {
  del([destinationFolder]).then(() => done());
}

function cleanMap(done) {
  del([
    path.join(destinationFolder, '**/*.map')
  ])
  .then(() => done());
}

function concatCSS() {
  return gulp.src(
    path.join(destinationFolder, 'assets/**/*.css'))
    .pipe(concatCss(`app.${manifest.version}.css`))
    .pipe(gulp.dest(path.join(destinationFolder, 'assets')));
}

function compileSASS() {
  return gulp.src([
    'src/assets/**/*-structure.scss',
    'src/assets/**/*-skin.scss'
  ])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(path.join(destinationFolder, 'assets')));
}

function minCSS() {
  return gulp.src(path.join(destinationFolder, 'assets/**/*.css'))
      .pipe(cssmin())
      .pipe(rename({suffix: `.min`}))
      .pipe(gulp.dest(path.join(destinationFolder, 'assets')));
}

function release(done) {
  releaseBuild = true;

  runSequence(
    'build',
    'clean-map',
    done
  );
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

function updateIndexFile() {
  let cssFileName = releaseBuild ? `assets/app.${manifest.version}.min.css` : `assets/app.${manifest.version}.css`;
  let jsFileName = releaseBuild ? `${exportJSFileName}.${manifest.version}.min.js` : `${exportJSFileName}.${manifest.version}.js`;

  return gulp.src(path.join(destinationFolder, 'index.html'))
    .pipe(htmlreplace({
        'css': cssFileName,
        'js': {
          src: jsFileName,
          tpl: '<script src="%s" defer></script>'
        }
    }))
    .pipe(gulp.dest(destinationFolder));
}

const watchFiles = ['src/**/*', 'test/**/*', 'package.json', '**/.eslintrc'];

// Run the headless unit tests as you make changes.
function watch() {
  gulp.watch(watchFiles, ['build']);
}

function testBrowser() {
  // Our testing bundle is made up of our unit tests, which
  // should individually load up pieces of our application.
  // We also include the browser setup file.
  const testFiles = glob.sync('./test/unit/**/*.js');
  const allFiles = ['./test/setup/browser.js'].concat(testFiles);

  // Lets us differentiate between the first build and subsequent builds
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

// Remove map files
gulp.task('clean-map', cleanMap);

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
gulp.task('release', release);

// Build the src files
gulp.task('build-src', buildSrc);

gulp.task('clean-css', cleanCSS);
gulp.task('copy-fonts', copyFonts);
gulp.task('compile-sass', compileSASS);
gulp.task('concat-css', concatCSS);
gulp.task('copy-static', ['copy-fonts'], copyStatic);
gulp.task('min-css', minCSS);
gulp.task('update-index-file', ['copy-fonts'], updateIndexFile);

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
