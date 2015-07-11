var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jsmin = require('gulp-uglify');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var preprocess = require('gulp-preprocess');
var pkg = require('./package');

gulp.task('validate', function() {
  return gulp.src([
    '*.js',
    'src/*.js',
    'test/*.js'
  ])
  .pipe(jscs({
    preset: 'airbnb',
    requirePaddingNewLinesAfterBlocks: null,
    safeContextKeyword: null
  }))
  .pipe(jshint({
    lookup: false,
    curly: true,
    eqeqeq: true,
    eqnull: true,
    expr: true,
    noarg: true,
    undef: true,
    unused: true,
    node: true,
    mocha: true,
    predef: ['define']
  }))
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'));
});

gulp.task('build', function() {
  return gulp.src('src/index.js')
      .pipe(preprocess({
        context: {
          VERSION: 'v' + pkg.version
        }
      }))
      .pipe(gulp.dest('build'));
});

gulp.task('test', ['validate', 'build'], function() {
  return gulp.src('test/*.js')
      .pipe(mocha({
        reporter: 'min'
      }));
});

gulp.task('dist', ['test'], function() {
  return gulp.src('build/index.js')
      .pipe(rename(pkg.name + '.js'))
      .pipe(gulp.dest('dist'))
      .pipe(jsmin({
        preserveComments: 'some'
      }))
      .pipe(rename(pkg.name + '.min.js'))
      .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch([
    'src/*.js',
    'test/*.js'
  ], ['test']);
});

gulp.task('default', ['test', 'watch']);
