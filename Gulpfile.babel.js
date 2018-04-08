import gulp from 'gulp';
import babel from 'gulp-babel';

gulp.task('build', () => {
	gulp.src('src/**/*.js')
		.pipe(babel())
		.pipe(gulp.dest('.'))
})

gulp.task('watch', () => {
	gulp.watch('src/**/*.js', ['build'])
})

gulp.task('default', ['build', 'watch'])