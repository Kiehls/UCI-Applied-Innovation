var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sys = require('sys');
var exec = require('child_process').exec;
var time = require('time');
require('date-utils');

var child;
var temhum;

var regIds = [];

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// child = exec ('mkdir /tmp/stream', function (error, stdout, stderr) { // For video streaming
// });
// child = exec ('raspistill --nopreview -w 640 -h 480 -q 5 -o /tmp/stream/pic3.jpg -tl 100 -t 55555 -th 0:0:0 &', function (error, stdout, stderr) {
// }); // For video streaming
// child = exec ('python ./detecting.py 22 4', function (error, stdout, stderr) { // For detecting temp-hum
// });
// child = exec ('LD_LIBRARY_PATH=/usr/local/lib mjpg_streamer -i "input_file.so -f /tmp/stream -n pic.jpg" -o "output_http.so -w /usr/local/www"', function (error, stdout, stderr) {
// }); // For video streaming
// child = exec ('python saveDB.py', function (error, stdout, stderr) {
// }); // For save sleeping's data to DB
// child = exec ('python sendLog.py', function (error, stdout, stderr) {
// }); // For send sleeping's data to Android

console.log ('Server is waiting for connection');

var starTime = 0;
var wakeUp = 0;
var sleeping = 0;

var tempHumGcmOff = 0;
var babyGcmOff = 0;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
