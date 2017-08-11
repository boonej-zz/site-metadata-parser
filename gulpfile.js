const gulp = require('gulp');
const mocha = require('gulp-mocha');
const babel = require('gulp-babel');

gulp.task('build', function(){
  gulp.src('src/scraper.js')
    .pipe(babel({
      
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('test', ['build'], function(){
  return gulp.src(['spec/*_spec.js'], {read: false}).pipe(
    mocha({
      reporter: 'spec'
    })
  )
});
