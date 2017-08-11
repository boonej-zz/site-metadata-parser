const gulp = require('gulp');
const mocha = require('gulp-mocha');
const babel = require('gulp-babel');

gulp.task('test', function(){
  return gulp.src(['spec/*_spec.js'], {read: false}).pipe(
    mocha({
      reporter: 'spec'
    })
  )
});

gulp.task('build', ['test'], function(){
  gulp.src('src/scraper.js')
    .pipe(babel({
      
    }))
    .pipe(gulp.dest('lib'));
});