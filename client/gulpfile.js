var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync').create();

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

gulp.task('styles', () => {
    return gulp.src('app/scss/*.scss')
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe(gulp.dest('app/css'))
        .pipe(reload({stream: true}));
});

gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: "./app"
        }
    });

    gulp.watch([
        'app/*.html',
        'app/**/*.js'
    ]).on('change', reload);

    gulp.watch('app/scss/**/*.scss', ['styles']);    
});
