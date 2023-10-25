/* eslint-disable prettier/prettier */
const express = require('express');
const morgan = require('morgan');

const app = express();
const ToursRout = require('./Routs/ToursRouts');
const UserRout = require('./Routs/UserRouts');

// 2) middlewares
app.use(express.json());
app.use(morgan('dev')); // 
app.use(express.static(`${__dirname}/public`)); // to access static files e.g : html css imgs etc.

//3) ROUTS --> top
app.use('/api/v1/tours', ToursRout);
app.use('/api/v1/users', UserRout);

// ? --> for optional params
// TOURS Routs

// app.get('/api/v1/tours', GETALLTours);
// app.post('/api/v1/tours', CreateTour);
// app.get('/api/v1/tours/:id', GetTour);
// app.patch('/api/v1/tours/:id', UpdateTour);
// app.delete('/api/v1/tours/:id', DeleteTour);

module.exports = app;

