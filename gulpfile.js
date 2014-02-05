'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var rename = require('gulp-rename');

var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

gulp.task('concat', function() {
  gulp.src('./index.js')
  .pipe(header(banner, {pkg: pkg}))
  .pipe(gulp.dest('./dist'));
});

gulp.task('uglify', function() {
  gulp.src('./index.js')
    .pipe(uglify({
      mangle: {
        except: ['require', 'export']
      }
    }))
    .pipe(rename('bundle-loader.min.js'))
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['concat', 'uglify']);
