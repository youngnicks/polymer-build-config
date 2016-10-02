'use strict';

const gulp = require('gulp');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const cssSlam = require('css-slam').gulp;
const htmlMinifier = require('gulp-html-minifier');
const mergeStream = require('merge-stream');
const lazypipe = require('lazypipe');
const PolymerProject = require('polymer-build').PolymerProject;
const forkStream = require('polymer-build').forkStream;
const webserver = require('gulp-webserver');

gulp.task('build', () => {
  const project = new PolymerProject(require('./polymer.json'));

  const jsChannel = lazypipe()
    .pipe(babel)
    .pipe(uglify);

  const sourcesStream = project.sources()
    .pipe(project.splitHtml())
    .pipe(gulpif(/\.js$/, jsChannel()))
    .pipe(gulpif(/\.css$/, cssSlam()))
    .pipe(gulpif(/\.html$/, htmlMinifier()))
    .pipe(project.rejoinHtml());

  const buildStream = mergeStream(sourcesStream, project.dependencies())
    .pipe(project.analyzer);

  const unbundledBuildStream = forkStream(buildStream)
    .pipe(gulp.dest('build/unbundled'));

  const bundledBuildStream = forkStream(buildStream)
    .pipe(project.bundler)
    .pipe(gulp.dest('build/bundled'));
});

gulp.task('serve', () => {
  gulp.src('build/bundled')
    .pipe(webserver({
      livereload: true,
      open: true
    }));
});

gulp.task('watch', () => {
  gulp.watch('src/**', ['build']);
});

gulp.task('dev', ['serve', 'watch']);
gulp.task('default', ['build']);
