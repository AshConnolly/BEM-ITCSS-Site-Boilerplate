var gulp = require('gulp'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    uglify = require("gulp-uglify"),
    browsersync = require('browser-sync').create();

var sourcemaps = require('gulp-sourcemaps');

var siteroot = "./";


gulp.task('mincss', function () {
        gulp.src(siteroot + 'dist/css/main.css', {base: "."})
        .pipe(cssmin())
        // .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest("."))
        .pipe(browsersync.stream());
});


gulp.task('sass', function () {
  return gulp.src(
        './src/sass/*.scss'
    )
    .pipe(sourcemaps.init())
    .pipe(sass().on(
        'error', sass.logError
    ))
    .pipe(autoprefixer(['ie 9', 'safari 6', 'Firefox < 20']))
    .pipe(rename('main.css'))
    .pipe(sourcemaps.write())    
    .pipe(gulp.dest(
        './dist/css/'
    ))
    .pipe(browsersync.reload({
        stream: true
    }))
});


gulp.task('js', function() {
    // set concat order to dependencies first then all other remaining files - 
    //return gulp.src([siteroot + 'js/bacon.js', siteroot + 'js/eggs.js', siteroot + 'js/*.js' ])
      return gulp.src(siteroot + 'src/js/**/*.js')
        .pipe(concat('main.js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/js'));
});

//image min - combines gifsicle, jpegtran, optipng, svgo
gulp.task('imgcomp', () => {
    return gulp.src(siteroot + 'img/**/*')
        .pipe(imagemin({
            optimizationLevel: 4,
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img'));
});


// Static server
gulp.task('browsersync', function() {
    browsersync.init({
        server: {
            //files: ["./dist/css/*.css"],
            //baseDir: ["app", "dist"] //location of site
            baseDir: "./" //location of site
        }
    });
});

// dynamic site
// gulp.task('browsersync', function() {
//     browsersync.init({
//         proxy: "http://localhost:8888/atomic-site-boilerplate/app" // Server link
//     });
// });

//below will watch files once the browsersync task is completed
gulp.task('watch', ['browsersync'], function() {
    gulp.watch(siteroot + 'src/sass/**/*.scss', ['sass']);
    gulp.watch(siteroot + 'dist/css/main.css', ['mincss']);
    gulp.watch(siteroot + 'src/js/**/*.js', ['js']);
    gulp.watch(siteroot + '**/*.html', browsersync.reload);
    gulp.watch(siteroot + '**/*.php', browsersync.reload);
    gulp.watch(siteroot + 'src/js/**/*.js', browsersync.reload);
    // Other watchers
})

// gulp.task('default', ['sass', 'js', 'browsersync', 'watch']);
gulp.task('default', ['sass', 'js', 'watch']);
