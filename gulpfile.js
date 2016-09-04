var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    fileinclude = require('gulp-file-include'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    connect = require('gulp-connect'),
    plumber = require('gulp-plumber'),
    autoprefixer = require('gulp-autoprefixer'),
    server = lr(),
    path = require("path"),
    minifyCss = require('gulp-minify-css'),
    del = require('del'),
    concatCss = require('gulp-concat-css'),
    vinylPaths = require('vinyl-paths'),
    sourcemaps = require('gulp-sourcemaps'),
    fs = require("fs"),
    s3 = require("gulp-s3"),
    awsCredentials = JSON.parse(fs.readFileSync('./aws.json'));

// fileinclude: grab partials from templates and render out html files
// ==========================================
gulp.task('fileinclude', function() {
  return gulp.src('./src/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(livereload(server));
});

// minify js
// compress

gulp.task('fonts', function() {
  return gulp.src('./src/fonts/*')
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('copyFiles', function() {
  return gulp.src(['./src/*'])
    .pipe(gulp.dest('./dist'));
});

gulp.task('imgs', function() {
  return gulp.src('./src/img/*')
    .pipe(gulp.dest('./dist/img'));
});

//  Sass: compile sass to css task - uses Libsass
//===========================================
gulp.task('sass', function() {
  return gulp.src('./src/css/*.scss')
    .pipe(sass({ style: 'expanded', sourceComments: 'map', errLogToConsole: true}))
    .pipe(autoprefixer('last 2 version', "> 1%", 'ie 8', 'ie 9'))
    .pipe(gulp.dest('./dist/tempCss'))
    .pipe(livereload(server));
});

gulp.task('copyCss', function() {
  return gulp.src('./src/css/*.css')
    .pipe(gulp.dest('./dist/tempCss'));
});

gulp.task('copyJs', function() {
  return gulp.src('./src/js/**/*')
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('concatCss', ['sass', 'copyCss'], function() {
  return gulp.src('./dist/tempCss/*.css')
    .pipe(concatCss('bundle.css'))
    .pipe(sourcemaps.init())
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('clean', ['concatCss'], function(cb) {
  del(['dist/tempCss'], cb);
});

//  Connect: server task
//===========================================
gulp.task('connect', function() {
  connect.server({
    port: 1337,
    root: 'dist',
    livereload: true
  });
});

//  Watch and Livereload using Libsass
//===========================================
gulp.task('watch', function() {
  // Listen on port 35729
  server.listen(35729, function (err) {
    if (err) {
      return console.error(err);
      //TODO use notify to log a message on Sass compile fail and Beep
    }

    //Watch task for sass
    gulp.watch('./src/css/**', ['concatCss', 'clean']);

    // watch task for gulp-includes
    gulp.watch('./src/*.html', ['fileinclude']);
  });
});

gulp.task('build', ['fonts', 'copyFiles', 'imgs', 'copyJs', 'fileinclude', 'concatCss', 'clean'], function() {

});

gulp.task('deploy', ['build'], function() {
  return gulp.src('dist/**')
    .pipe(s3(awsCredentials, {
      uploadPath: "/",
      headers: {
        'x-amz-acl': 'public-read'
      }
    }));
});

//  Default Gulp Task
//===========================================
gulp.task('default', ['fonts', 'copyFiles', 'imgs', 'copyJs', 'fileinclude', 'concatCss', 'clean', 'connect', 'watch'], function() {

});
