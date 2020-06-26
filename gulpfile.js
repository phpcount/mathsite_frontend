let gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    polyfill = require("babel-polyfill"),
    // JSON Server
    jsonServer = require("gulp-json-srv"),
    server = jsonServer.create({
    port: 3002,
    // baseUrl: "/frontend/math-site__frontend/app/json",
  });

gulp.task("json", function () {
  return gulp.src("app/json/*.json")
    .pipe(server.pipe());
});


const babel = require('gulp-babel');

gulp.task('babel', () =>
  gulp.src('app/js/es6/*.js')
    .pipe(babel()) // config -> .babelrc
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('app/js'))
);

gulp.task('clean', async function(){
  del.sync('dist')
})

gulp.task('scss', function(){
  return gulp.src('app/scss/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(autoprefixer({
      //browsers: ['last 8 versions']
      overrideBrowserslist: ['last 8 versions']
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('css', function(){
  return gulp.src([
    'node_modules/normalize.css/normalize.css',
    'node_modules/slick-carousel/slick/slick.css',
    'node_modules/animate.css/animate.css',
  ])
    .pipe(concat('_libs.scss'))
    .pipe(gulp.dest('app/scss'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('html', function(){
  return gulp.src('app/*.html')
  .pipe(browserSync.reload({stream: true}))
});

gulp.task('script', function(){
  return gulp.src('app/js/*.js')
  .pipe(browserSync.reload({stream: true}))
});

gulp.task('js', function(){
  return gulp.src([
    'node_modules/slick-carousel/slick/slick.js'
  ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('browser-sync', function() {
  browserSync.init({
    proxy: "http://localhost/frontend/math-site__frontend/app"
    /*server: {
        baseDir: "app/"
    }*/
  });
});

gulp.task('export', async function(){
  let buildHtml = gulp.src('app/**/*.html')
    .pipe(gulp.dest('dist'));

  let BuildCss = gulp.src('app/css/**/*.css')
    .pipe(gulp.dest('dist/css'));

  // let BuildJs = gulp.src('app/js/**/*.js')
  let BuildJs = gulp.src(['!app/js/es6/**/*.js', 'app/js/*.js'])
    .pipe(gulp.dest('dist/js'));
    
  let BuildFonts = gulp.src('app/fonts/**/*.*')
    .pipe(gulp.dest('dist/fonts'));

  let BuildImg = gulp.src('app/img/**/*.*')
    .pipe(gulp.dest('dist/img'));   
});

gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', gulp.parallel('scss'))
  gulp.watch('app/*.html', gulp.parallel('html'))
  gulp.watch('app/js/*.js', gulp.parallel('script'))
  gulp.watch('app/js/es6/*.js', gulp.parallel('babel'))
  gulp.watch("app/json/*.json", gulp.parallel('json'))
});

gulp.task('build', gulp.series('clean', 'export'))

gulp.task('default', gulp.parallel('css', 'scss', 'js', 'babel', 'browser-sync', 'json', 'watch'));