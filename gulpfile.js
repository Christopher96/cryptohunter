/* 
 * Gulpfile for starting dev server
 */

// Gets required plugins
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync').create();
var nodemon = require('gulp-nodemon');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

// Slight delay after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 500;

// Nodemon gulp task, starts server and file watch
gulp.task('nodemon', function(cb) {
    var called = false;
    return nodemon({
            // Nodemon our expressjs server
            script: 'server.js',

            // Watch core server file(s) that require server restart on change
            watch: [
                'server.js',
                'routes/**/*.js'
            ]
        })
        .on('start', function onStart() {
            // Ensure start only got called once
            if (!called) { cb(); }
            called = true;
        })
        .on('restart', function onRestart() {
            // Reload connected browsers after a slight delay
            setTimeout(function() {
                reload({
                    stream: false
                });
            }, BROWSER_SYNC_RELOAD_DELAY);
        });
});

// Serves up browser-sync and nodemon on port 4000 and watches for html, scss and js changes
gulp.task('serve', ['nodemon'], () => {
    browserSync.init({
        proxy: 'localhost:4000',
        port: 3000,
        open: false
    });

    gulp.watch('public/app/scss/**/*.scss', ['styles']);

    gulp.watch([
        'public/**/*.html',
        'public/**/*.js'
    ]).on('change', reload);
});

// Task for compiling SCSS to main CSS stylesheet
gulp.task('styles', () => {
    gulp.src('public/app/scss/*.scss')
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe(gulp.dest('public/app/css'))
        .pipe(reload({ stream: true }));
});
