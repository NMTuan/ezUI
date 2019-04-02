var gulp = require('gulp');
var del = require('del');

//js
var babel = require('gulp-babel');
// var sourcemaps = require('gulp-sourcemaps');
// var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var config = {
    srcPath: 'src/',
    tmpPath: 'tmp/',
    distPath: 'dist/',
};

//del
gulp.task('del', function (callback) {
    del.sync([config.tmpPath, config.distPath]);
    callback();
});

//es6 --> es5
gulp.task('js', function () {
    var task = gulp.src(config.srcPath + 'js/**/*.js')
        // .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        // .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(config.tmpPath + 'js/'));
    return task;
});

//require
gulp.task('browserify', function () {
    var b = browserify({
        entries: config.tmpPath + 'js/ezUI.js'
    });

    return b.bundle()
        .pipe(source('ezUI.js'))
        // .pipe(buffer())
        // .pipe(sourcemaps.init())
        // .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(config.distPath + 'js/'));
});

//watch
gulp.task('watch', function () {
    gulp.watch(config.srcPath + '**/*.js', gulp.series('del', 'js', 'browserify'));
});

gulp.task('serve', gulp.series('del', 'js', 'browserify', 'watch'));