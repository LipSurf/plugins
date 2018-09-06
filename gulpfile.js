const gulp = require('gulp');
const ts = require('gulp-typescript');
const glob = require('glob');
const uglifyjs = require('uglify-es');
const composer = require('gulp-uglify/composer');
const typedoc = require('gulp-typedoc');
const minify = composer(uglifyjs, console);

gulp.task('default', function() {
	return glob.sync('src/*').map((folder) => {
		let filename = folder.replace('src/', '') + '.js';
		return gulp.src([folder + '/*.ts','test.ts'])
			.pipe(ts.createProject('tsconfig.json', {
				outFile: filename
			})())
			.pipe(gulp.dest('build'));
	});
});

gulp.task('prod', function() {
	return glob.sync('src/*').map((folder) => {
		let filename = folder.replace('src/', '') + '.js';
		return gulp.src([folder + '/*.ts','test.ts'])
			.pipe(ts.createProject('tsconfig.json', {
				outFile: filename
			})())
			.pipe(minify({
				mangle: false,
				compress: {
					pure_funcs: [
						'console.log',
						'console.dir',
					]
				}
			}))
			.pipe(gulp.dest('build'));
	});
});

gulp.task('watch', function() {
	return gulp.watch('src/**/*', ['default']);
});

gulp.task('watch-prod', function() {
	return gulp.watch('src/**/*', ['prod']);
});

gulp.task('docs', function() {
	return gulp
		.src(["src/"])
		.pipe(typedoc({
			out: "./docs",
			tsconfig: "./tsconfig.json",
		}))
	;
});
