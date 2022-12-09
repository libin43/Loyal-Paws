const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars')
const session = require('express-session')
const db = require('./config/connection')
const nocache = require("nocache")



db.connect((err)=>{
  if(err){
    console.log('Connection Error')
  }else{
    console.log('Database Connected')
  }
})


const adminRouter = require('./routes/admin');
const userRouter = require('./routes/users');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//In this we are attaching helpers with a helper condition

app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'userlayout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials/',
helpers:{
  isEqual: (status, value, options) => {
  if (status == value) {
    return options.fn(this)
  }
  return options.inverse(this)
},
  isGreater:(status, value, options)=>{
    if(status > value) {
      return options.fn(this)
    }
    return options.inverse(this)
  }
}
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//session
app.use(session({
  secret:'Key',
  resave:true,
  saveUninitialized:true,
  cookie:{maxAge:6000000000},
}))
//nocache
app.use(nocache())

app.use('/', userRouter);
app.use('/admin', adminRouter);

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
