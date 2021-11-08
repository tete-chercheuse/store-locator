// Grab our gulp packages
const gulp = require('gulp'),
  exec = require('child_process').exec,
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload;

// ----- Browser-Sync watch files and inject changes -----

gulp.task('build', cb => exec('npm run build', (err, stdout, stderr) => {
  console.log(stdout);
  console.error(stderr);
  cb(err);
}));

gulp.task('browsersync', gulp.parallel('build', () => {

  browserSync.init({
    server: {
      baseDir: 'demo',
      routes: {
        '/dist': './dist'
      }
    },
    ghostMode: false,
  });

  gulp.watch('./demo/**/*').on('change', reload);
  gulp.watch('./dist/**/*').on('change', reload);
  gulp.watch('./src/**/*', gulp.series('build'));

}));

// ----- Default Task -----

gulp.task('default', gulp.series('browsersync'));
