var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync').create();
var nodemon = require('gulp-nodemon');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

// we'd need a slight delay to reload browsers
// connected to browser-sync after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 500;

gulp.task('nodemon', function(cb) {
    var called = false;
    return nodemon({
            // nodemon our expressjs server
            script: 'server.js',

            // watch core server file(s) that require server restart on change
            watch: [
                'server.js',
                'routes/**/*.js'
            ]
        })
        .on('start', function onStart() {
            // ensure start only got called once
            if (!called) { cb(); }
            called = true;
        })
        .on('restart', function onRestart() {
            // reload connected browsers after a slight delay
            setTimeout(function() {
                reload({
                    stream: false
                });
            }, BROWSER_SYNC_RELOAD_DELAY);
        });
});


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
