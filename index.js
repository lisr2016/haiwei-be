let express = require('express');
let cors = require('cors');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let mongoose = require('mongoose');
let http = require('http');
let config = require('./config');
let auth = require('./controllers/auth');

let app = express();

let HTTP_PORT = process.env.HTTP_PORT || config.port;
app.set('HTTP_PORT', HTTP_PORT);

http.createServer(app).listen(HTTP_PORT, function () {
  console.info(`HTTP Server listening on port: %s, in %s mode`, HTTP_PORT, app.get('env'));
  // console.info(`=== 本服务器的IP是: `)
});

mongoose.connect(config.database, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use(require('./routes/unless'))
app.use(auth.verifyToken)
require('./routes/v1')(app)

app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  let code = err.status || 500;
  switch (err.name) {
    case 'HttpStatusError':
      if (code === 401 && err.message && (err.message.errorCode === 1 || err.message.errorCode === 2)) {
        console.error('成功返回错误信息');
        return res.status(200).json(err.message)
      }
      if (code === 400) {
        console.error('400 重定向, error = ', err.message);
        return res.redirect('/login');
      }
      if (code === 401 && err.message && err.message.errorCode === 3) {
        console.error('401 重定向, error = ', err.message);
        return res.redirect('/login');
      }
      break;
    default: break
  }
  if (code >= 500) {
    console.error('服务端Error', err);
  }
  return res.status(code).json(err);
});
