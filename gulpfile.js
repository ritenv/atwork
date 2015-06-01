var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('uglify', function() {
  return gulp.src([
  	/**
       * Load system files first
       */
      'system/public/utils.js',
      'system/public/index.js',
      'system/public/settings/settings.js',
      'system/public/settings/settings.controllers.js',
      'system/public/settings/settings.routes.js',
      'system/public/settings/settings.services.js',

      /**
       * Load the main module
       */
      'modules/**/public/!(*.test|*.controllers|*.services|*.routes).js',

      /**
       * Load the controllers, services and routes
       */
      'modules/**/public/**/*.controllers.js',
      'modules/**/public/**/*.services.js',
      'modules/**/public/**/*.routes.js',

      './public/app.js'
  	])
    .pipe(uglify())
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('uglifylibs', function() {
  return gulp.src([
	  './public/bower_components/jquery/dist/jquery.min.js',
      './public/bower_components/angular/angular.js',
      './public/bower_components/angular-aria/angular-aria.js',
      './public/bower_components/angular-animate/angular-animate.js',
      './public/bower_components/angular-material/angular-material.js',
      './public/bower_components/angular-route/angular-route.js',
      './public/bower_components/angular-messages/angular-messages.js',
      './public/bower_components/angular-resource/angular-resource.js',
      './public/bower_components/angular-loading-bar/build/loading-bar.min.js',
      './public/bower_components/lodash/lodash.min.js',

      './public/bower_components/q/q.js',
      './public/bower_components/ng-file-upload/angular-file-upload.js'
  	])
    .pipe(uglify())
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('pack', ['uglifylibs', 'uglify'], function() {
  return true;
});

gulp.task('sass', function () {
  gulp.src('./public/src/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./public/css'));
});

gulp.task('default', ['sass', 'pack']);

var watcher = gulp.watch(['public/**/*.scss', 'modules/**/public/**/*.js'], ['default', 'pack']);
watcher.on('change', function(event) {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});