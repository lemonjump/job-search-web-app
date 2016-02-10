var express = require('express');
var app = express();
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var flash   = require('connect-flash');
var morgan  = require('morgan');
var path = require('path');
var fs = require('fs');
var compression = require('compression');


// performance
app.use(compression());

app.use("/scripts", express.static(__dirname + '/scripts'));
app.use("/imgs", express.static(__dirname + '/imgs'));

app.use("/models", express.static(__dirname + '/models'));
app.use("/cofig", express.static(__dirname + '/config'));
app.use("/public/images", express.static(__dirname + '/public/images'));
app.use("/public/javascripts", express.static(__dirname + '/public/javascripts'));





var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');


require('./config/passport')(passport);
var configDB = require('./config/database.js');


app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views')); 
// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

// required for passport
app.use(session({ secret: 'csc309' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.use('/', router);
// routes ======================================================================
require('./routes/routes.js')(app,router, passport); // load our routes and pass in our app and fully configured passport

module.exports = app;

// var server = app.listen(3000, function () {
//   var host = server.address().address;
//   var port = server.address().port;
//   console.log('App listening at http://%s:%s', host, port);
// });