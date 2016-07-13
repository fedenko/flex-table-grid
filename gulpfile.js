'use strict';

// Include gulp and tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var exec = require('child_process').exec;
var notifier = require('node-notifier');

// Configuration used within this gulpfile

var dist = 'dist';

var includePaths  = [].concat(
    './node_modules'
);

var config = {
    stylus: {
      src: 'stylus/flex-table-grid.styl',
      watch : 'stylus/*.styl'
    },
    pug: 'index.pug'
};

// Autoprefixers
var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

function getRelativePath(absPath) {
    absPath = absPath.replace(/\\/g, '/');
    var curDir = __dirname.replace(/\\/g, '/');
    return absPath.replace(curDir, '');
}


function logPugError(error) {
    $.util.log($.util.colors.bgRed('Pug Error:'))
    $.util.log($.util.colors.bgRed(error.message));
    notifier.notify({ title: 'Gulp message', message: 'Pug Error!' });
}
function logStylusError(error) {
    $.util.log($.util.colors.bgRed('Stylus Error:'))
    $.util.log($.util.colors.bgRed(error.message));
    notifier.notify({ title: 'Gulp message', message: 'Stylus Error!' });
}

gulp.task('html', function() {
    return gulp.src([config.pug])
        .pipe($.pug({
          pretty: true
        }).on('error', logPugError))
        .pipe(gulp.dest('.'))
        .pipe($.size({title: 'html'}));
});

// Compile, concat, minify and automatically prefix stylesheets
gulp.task('styles', function() {
    return gulp.src([config.stylus.src])
        .pipe($.sourcemaps.init())
        .pipe($.stylus().on('error', logStylusError))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest(dist + '/css'))
        .pipe($.csso())
        .pipe($.rename({suffix: '.min'}))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(dist + '/css'))
        .pipe($.size({title: 'styles'}));
});

// Clear the cache
gulp.task('clear-cache', function() {
    // Clear all cached files
    $.cache.clearAll();
});


// Delete all generated files
gulp.task('clean', del.bind(null, [
    dist + '/css',
]));


// Optimize files and save the output to the dist folder
gulp.task('dist', ['clean'], function(cb) {
    runSequence('html', 'styles', cb);
});


// Optimize files, watch for changes & reload, the default task
gulp.task('default', ['dist'], function() {
    browserSync.init({
        notify: false,
        server: {
            baseDir: "./"
        }
    });
    gulp.watch([config.pug], ['html', reload]);
    gulp.watch([config.stylus.watch], ['styles', reload]);
});
