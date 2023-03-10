var gulp = require('gulp');
var del = require('del');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var gulpsync = require('gulp-sync')(gulp);
var sync = gulpsync.sync;

//css
var sass = require('gulp-sass');
var cssmin = require('gulp-clean-css');

//js
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');

//html
var ejs = require('gulp-ejs');
var html = require('gulp-html-beautify');
var htmlMin = require('gulp-htmlmin');

//serve
var browserSync = require('browser-sync');
var reload = browserSync.reload;

//release
var rev = require('gulp-rev');
var collector = require('gulp-rev-collector');
var replace = require('gulp-replace');


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
gulp.task('sass', function () {
    var task = gulp.src(config.srcPath + 'scss/*.scss')
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(gulp.dest(config.distPath + 'css/'))
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(config.distPath + 'css/'))
    ;
    return task;
});
gulp.task('css', ['sass'], reload);

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

//js
gulp.task('js', function () {
    var task = gulp.src(config.tmpPath + 'js/*.js')
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest(config.distPath + 'js/'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(config.distPath + 'js/'))
        .pipe(reload({
            stream: true
        }));
    return task;

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
            removeComments: true, //??????HTML??????
            collapseWhitespace: false, //??????HTML
            collapseBooleanAttributes: true, //???????????????????????? <input checked="true"/> ==> <input />
            removeEmptyAttributes: true, //?????????????????????????????? <input id="" /> ==> <input />
            removeScriptTypeAttributes: true, //??????<script>???type="text/javascript"
            removeStyleLinkTypeAttributes: true, //??????<style>???<link>???type="text/css"
            minifyJS: true, //????????????JS
            minifyCSS: true //????????????CSS
        }))
        .pipe(gulp.dest(config.distPath))
        .pipe(reload({
            stream: true
        }));
    return task;
});

//static
gulp.task('static', function () {
    var task = gulp.src(config.srcPath + '/static/**/*.*')
        .pipe(gulp.dest(config.distPath + 'static/'));
    return task;
});

//data
gulp.task('data', function () {
    var task = gulp.src(config.srcPath + '/data/**/*.*')
        .pipe(gulp.dest(config.distPath + 'data/'));
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

    gulp.watch(config.srcPath + 'scss/**/*.scss', ['css']);
    gulp.watch(config.srcPath + 'js/**/*.js', sync(['babel', 'js']));
    gulp.watch(config.srcPath + '**/*.ejs', ['html']);
    gulp.watch(config.srcPath + 'data/**/*.json', ['data']);
});

//rev
gulp.task('rev', sync(['rev:css', 'rev:js']));
//?????????css, ????????????????????????
gulp.task('rev:css', function () {
    return gulp.src([
        config.distPath + '/css/*.min.css'
    ])
        .pipe(collector({
            replaceReved: true
        }))
        .pipe(rev())
        .pipe(gulp.dest(config.distPath + '/css'))
        .pipe(gulp.dest('../octopus/backend/web/static/ezui/css'))
        .pipe(gulp.dest('../octopus/agent/web/static/ezui/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.distPath + '/css'))
        .pipe(gulp.dest('../octopus/backend/web/static/ezui/css'))
        .pipe(gulp.dest('../octopus/agent/web/static/ezui/css'))
        ;
});
//?????????js, ????????????????????????
gulp.task('rev:js', function () {
    return gulp.src([
        config.distPath + '/js/*.min.js'
    ])
        .pipe(collector({
            replaceReved: true
        }))
        .pipe(rev())
        .pipe(gulp.dest(config.distPath + '/js'))
        .pipe(gulp.dest('../octopus/backend/web/static/ezui/js'))
        .pipe(gulp.dest('../octopus/agent/web/static/ezui/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.distPath + '/js'))
        .pipe(gulp.dest('../octopus/backend/web/static/ezui/js'))
        .pipe(gulp.dest('../octopus/agent/web/static/ezui/js'))
        ;
});

gulp.task('serve', sync(['del', 'css', 'babel', 'js', 'html', 'static', 'data', 'watch']));
gulp.task('release', sync(['del', 'css', 'babel', 'js', 'html', 'static', 'data', 'rev']));
