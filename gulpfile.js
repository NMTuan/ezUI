var gulp = require('gulp');
var del = require('del');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');

//css
var sass = require('gulp-sass');

//js
var babel = require('gulp-babel');
// var sourcemaps = require('gulp-sourcemaps');
// var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

//html
var ejs = require('gulp-ejs');
var html = require('gulp-html-beautify');
var htmlMin = require('gulp-htmlmin');

//serve
var browserSync = require('browser-sync');
var reload = browserSync.reload;


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

//css
gulp.task('css', function () {
    var task = gulp.src(config.srcPath + 'scss/*.scss')
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(gulp.dest(config.distPath + 'css/'))
        .pipe(reload({
            stream: true
        }));
    return task;
});

//es6 --> es5
gulp.task('babel', function () {
    var task = gulp.src(config.srcPath + 'js/**/*.js')
        .pipe(plumber())
        // .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        // .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(config.tmpPath + 'js/'));
    return task;
});

//require
gulp.task('js', function () {
    var b = browserify({
        entries: config.tmpPath + 'js/ezUI.js'
    });

    return b.bundle()
        .pipe(source('ezUI.js'))
        .pipe(plumber())
        // .pipe(buffer())
        // .pipe(sourcemaps.init())
        // .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(config.distPath + 'js/'))
        .pipe(reload({
            stream: true
        }));
});

//html
gulp.task('html', function () {
    var task = gulp.src(config.srcPath + '**/!(_)*.ejs')
        .pipe(plumber())
        .pipe(ejs())
        .pipe(rename({
            extname: '.html'
        }))
        .pipe(html({
            "indent_size": 4,
            "indent_char": " ",
            "eol": "\n",
            "indent_level": 0,
            "indent_with_tabs": false,
            "preserve_newlines": true,
            "max_preserve_newlines": 0,
            "jslint_happy": false,
            "space_after_anon_function": false,
            "brace_style": "collapse",
            "keep_array_indentation": false,
            "keep_function_indentation": false,
            "space_before_conditional": true,
            "break_chained_methods": false,
            "eval_code": false,
            "unescape_strings": false,
            "wrap_line_length": 0,
            "wrap_attributes": "auto",
            "wrap_attributes_indent_size": 4,
            "end_with_newline": true
        }))
        .pipe(htmlMin({
            removeComments: true, //清除HTML注释
            collapseWhitespace: false, //压缩HTML
            collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
            removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
            minifyJS: true, //压缩页面JS
            minifyCSS: true //压缩页面CSS
        }))
        .pipe(gulp.dest(config.distPath))
        .pipe(reload({
            stream: true
        }));
    return task;
});

//watch
gulp.task('watch', function () {
    browserSync.init({
        server: {
            baseDir: './dist/',
            directory: true
        },
        ghostMode: false,
        online: false,
        notify: false
    });

    gulp.watch(config.srcPath + 'scss/**/*.scss', gulp.series('css'));
    gulp.watch(config.srcPath + 'js/**/*.js', gulp.series('babel', 'js'));
    gulp.watch(config.srcPath + '**/*.ejs', gulp.series('html'));
});

gulp.task('serve', gulp.series('del', 'css', 'babel', 'js', 'html', 'watch'));