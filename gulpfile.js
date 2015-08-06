var gulp   = require( 'gulp' );
var sass   = require( 'gulp-sass' );
var concat = require( 'gulp-concat' );

gulp.task( 'sass', function () {
    gulp.src( './sass/**/*.scss' )
        .pipe( sass().on( 'error', sass.logError ) )
        .pipe( gulp.dest( './css' ) );
} );

gulp.task( 'scripts', function() {
    return gulp.src( './bower_components/jquery/dist/jquery.min.js' )
        .pipe( concat( 'vendor.js' ) )
        .pipe( gulp.dest( './js/' ) );
});
