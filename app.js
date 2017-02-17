var express = require('express');
var debug = require('debug')('bcs:server');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sys = require('sys');
var exec = require('child_process').exec;
var time = require('time');
require('date-utils');

var port = normalizePort(process.env.PORT || '3001');
//app.set('port', port);

var child;
var temhum;

// var message = new gcm.Message ();
var regIds = [];

var index = require('./routes/index');
var users = require('./routes/users');
var app = express();

var server = http.createServer(app);
console.log("------Server Start------");

var starTime = 0;
var wakeUp = 0;
var sleeping = 0;

var tempHumGcmOff = 0;
var babyGcmOff = 0;

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

child = exec('raspivid -t 0 -h 720 -w 1280 -fps 25 -hf -b 2000000 -o - | gst-launch-1.0 -v fdsrc ! h264parse ! rtph264pay config-interval=1 pt=96 ! gdppay ! tcpserversink host=192.168.0.44 port=5000', function(err, stdout, stderr) {
});
child = exec ('python ./detecting.py 11 22', function (error, stdout, stderr) { // For detecting temp-hum
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/', index);
app.use('/test', index)

var io = require('socket.io')(server);
io.on('connection', function (client) {
    console.log('client connected!');

    client.on('data', function (data) {
        console.log(data);
        var signal = data.toString();
        if (signal == 1) {
            console.log('Temp-Hum signal is detected');
            child = exec ('sudo /home/pi/UCI-Applied-Innovation/function/Adafruit_Python_DHT/examples/AdafruitDHT.py 11 22', function (error, stdout, stderr) {
                temhum = stdout;
                console.log(temhum);
            });
        }
        else if (signal == 2) {
            console.log('Stream signal is detected');
            child = exec('raspivid -t 0 -h 720 -w 1280 -fps 25 -hf -b 2000000 -o - | gst-launch-1.0 -v fdsrc ! h264parse ! rtph264pay config-interval=1 pt=96 ! gdppay ! tcpserversink host=192.168.0.44 port=5000', function (err, stdout, stderr) {
                console.log("Signal is 2");
            });
        }
        else if (signal == 3) {
            console.log('Voice signal is detected');
        }
        else if (signal == 4 && tempHumGcmOff == 0) {
            console.log('Temperature inappropriate signal is detected');
        }
        else if (signal == 5 && tempHumGcmOff == 0) {
            console.log('Humidity inappropriate signal is detected');
        }
        else if (signal == 6 && tempHumGcmOff == 0) {
            console.log('Temp-Hum inappropriate signal is detected');
        }
        else if (signal == 7) {
            console.log('Baby crying signal is detected');
        }
        else if (signal == 8) {

        }
        else if (signal == 9) {
            console.log('Baby is now wake up')
        }
        else if (signal == 10) {
            console.log("Temp-Hum GCM off signal is detected");
            tempHumGcmOff = 1;
        }
        else if (signal == 11) {
            console.log("Temp-Hum GCM on signal is detected");
            tempHumGcmOff = 0;
        }
        else if (signal == 12) {
            console.log("Baby wake up GCM off signal is detected");
            babyGcmOff = 1;
        }
        else if (signal == 13) {
            console.log("Baby wake up GCM on signal is detected");
            babyGcmOff = 0;
        }
        else {
            console.log(signal);
            var i;
            var registered = 0;

            for (i = 0; i < regIds.length; i++) {
                if (regIds[i] == signal) {
                    registered = 1;
                    break;
                }
            }
            if (!registered) {
                regIds.push(signal);
                console.log(regIds.length);
            }
        }
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

module.exports = app;
