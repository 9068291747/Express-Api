var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const cors = require('cors');
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// mongodb connection START
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'gjust';

let db;
MongoClient.connect(url, function (err, client) {
  assert.equal(null, err);
  db = client.db(dbName);
  console.log("Database connected successfully to server");
});
// mongodb connection END
//Insert data START

app.post('/register_data', (req, res) => {
  const { username, password, confirmpassword, gender } = req.body;
  const collection = db.collection('registration_data');
  collection.insertMany([{ username, password, confirmpassword, gender }], function (err, result) {
    if (!err) {
      res.status(200).json({ 'data': result });
    } else {
      res.status(500).json({ err });
    }
  });
});

//Insert data END

// check login START
app.post('/login_check', (req,res) => {
  const { username, password } = req.body;
  const collection = db.collection('registration_data');
  collection.find({ username, password }).toArray(function(err, docs) {
    if(!err && docs.length === 0){
      res.status(200).json({ 'data': 'Wrong login details', 'status': false });
    }else {
      res.status(200).json({data: docs});
    }
  });
});

//check login END


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
