var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken');

var indexRouter = require('./routes/index');
var animeRouter = require('./routes/anime');
var usersRouter = require('./routes/users');
var charactersRouter = require('./routes/characters');
var staffRouter = require('./routes/staff');
var profileRouter = require('./routes/profile');

var app = express();

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API del progetto Anime',
      version: '1.0.0',
      description: 'Documentazione delle API del progetto',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

require('dotenv').config();
const mockDataStatus = process.env.USE_MOCK_DATA === 'true';
app.MockDataStatus = mockDataStatus;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layout/main' });

const hbs = require('hbs');
hbs.registerPartials(path.join(__dirname, 'views/partials'));
hbs.registerHelper('json', function (obj) {
  return JSON.stringify(obj, null, 2);
});

hbs.registerHelper('any', function () {
  const args = Array.prototype.slice.call(arguments);
  const options = args.pop();
  for (let i = 0; i < args.length; i++) {
    if (args[i]) {
      return options.fn(this);
    }
  }
  return options.inverse(this);
});

hbs.registerHelper('isHttpUrl', function (value) {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const token = req.cookies.auth_token;
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_super_secret_key'
      );
      res.locals.user = decoded;
    } catch (err) {
      res.clearCookie('auth_token');
    }
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/anime', animeRouter);
app.use('/users', usersRouter);
app.use('/characters', charactersRouter);
app.use('/staff', staffRouter);
app.use('/profile', profileRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
