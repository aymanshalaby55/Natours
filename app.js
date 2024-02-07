/* eslint-disable prettier/prettier */
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookie =  require('cookie-parser')
const compression = require('compression');

const AppErorr = require('./utils/appError.js');
const ToursRout = require('./Routs/ToursRouts');
const UserRout = require('./Routs/UserRouts');
const reviewRout = require('./Routs/reviewRout');
const bookingRouter = require('./Routs/bookingRouts');
const GlobalError = require('./Controllers/errorController.js');
const bookingController = require('./Controllers/bookingController.js');
const viewRouts = require('./Routs/viewRouts.js');

const app = express();

app.enable('trust proxy');

// 2) middlewares
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.use(helmet()); // set security https headers

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use(cors());
app.options('*',cors());

// limit req for same api
const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP, please try again in an hour'
});

// only for api rout
app.use('/api', limit);

// webhood dose need data in stream insted of json
app.post('/webhook-checkout', express.raw({type: 'application/json'}) , bookingController.webhookCheckout)

// Body parser, reading data for body (req.body)
app.use(express.json({ limit: '10kb' })); // limit body size to 10kb only
app.use(express.urlencoded({extended: true , limit:'10kb'})); //get encoded data from html action.
app.use(cookie());

// data sanitization against NoSQL query injection.
app.use(mongoSanitize()); // filter all $ and :

// data sanitization XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(express.static(path.join(__dirname, 'public'))); // to access static files e.g : html css imgs etc.

app.use(compression());

app.use((req, res, next) => {
 // console.log(req.cookies);
  next();
});

//3) ROUTS --> top
app.use('/', viewRouts);
app.use('/api/v1/tours', ToursRout);
app.use('/api/v1/users', UserRout);
app.use('/api/v1/reviwes', reviewRout);
app.use('/api/v1/bookings', bookingRouter);

//! if we are able to reach this point then there is no rout to handle the request
// all : for all http requests
// * :for any rout url
app.all('*', (req, res, next) => {
  // if next has argument express automaticly will skip all middlewares and go to our error handler middlerware
  next(new AppErorr(`can't find ${req.originalUrl} on this server`, 404));
});

// catch errors and send it to middleware error controller
app.use(GlobalError);

module.exports = app;
