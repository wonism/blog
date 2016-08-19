const gulp = require('gulp');
const jshint = require('gulp-jshint');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const gs = require('gulp-image-grayscale');

const paths = {
  // plugins: 'public/plugins/',
  img: 'src/img/',
  js: 'src/js/**/*.js',
  sass: 'src/scss/**/*.scss',
  sassDevelop: 'src/css',
  dist: 'dist/'
};

// jshint
gulp.task('hint', () => {
  return gulp.src(paths.js)
    .pipe(jshint({
      esnext: true
    }))
    .pipe(jshint.reporter('default'));
});

// minify js
gulp.task('js', () => {
  return gulp.src(paths.js)
    .pipe(sourcemaps.init())
    .pipe(rename({ suffix: '.min' }))
    /*
    .pipe(babel({
      presets: ['es2015']
    }))
    */
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dist + 'js'));
});

// compile scss
gulp.task('sass', () => {
  return gulp.src(paths.sass)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(gulp.dest(paths.sassDevelop))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(sourcemaps.write())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist + 'css'));
});

// compile js plugins
/*
gulp.task('jsPlugins', () => {
  return gulp.src(paths.plugins + paths.js)
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist + paths.plugins + 'js'));
});
*/

/*
// compile scss plugins
gulp.task('cssPlugins', () => {
  return gulp.src(paths.plugins + paths.sass)
    .pipe(sass())
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist + paths.plugins + 'css'));
});
*/

/*
// compile plugins
gulp.task('plugins', ['jsPlugins', 'cssPlugins']);
*/

gulp.task('watch', () => {
  gulp.watch(paths.js, ['js', 'hint']);
  gulp.watch(paths.sass, ['sass']);
});

// optimize images
/*
gulp.task('image', ['jpgs']);
*/

// optimize jpg
/*
gulp.task('jpgs', () => {
  return gulp.src(paths.img + '*.jpg')
    .pipe(imagemin({ progressive: true }))
    .pipe(gulp.dest(paths.dist + 'img'));
});
*/

// optimize png
/*
gulp.task('pngs', () => {
  return gulp.src(paths.img + '*.png')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(paths.dist + 'img'));
});
*/

/*
// grayscale image
gulp.task('grayscale', () => {
  return gulp.src(paths.img + '*.jpg')
    .pipe(gs({ logProgress: true }))
    .pipe(rename({ suffix: '-gray' }))
    .pipe(imagemin({ progressive: true }))
    .pipe(gulp.dest(paths.dist + 'img'));
});
*/

gulp.task('default', ['sass', 'js', 'watch']);

