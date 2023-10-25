const mongoose = require('mongoose');
// create mongoose schema :
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tour must have a name'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have duration'],
    select: false // don't appear
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'must have max size']
  },
  difficulty: {
    type: String,
    required: [true, 'Tour must have difficulty']
  },
  ratingsAverage: {
    type: Number,
    defult: 4.5
  },
  ratingsQuantity: {
    type: Number,
    defult: 0
  },
  price: Number,
  summary: {
    type: String,
    trim: true // remove all white spaces in the begin and end
  },
  description: {
    type: String,
    required: [true, 'A tour must have a describtion']
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: [String], // array of string
  createdAt: {
    type: Date,
    defult: Date.now()
  },
  startDates: [Date]
});

const Tour = mongoose.model('Tour', tourSchema);
const testTour = new Tour({
  name: 'ayman',
  rating: 2.1,
  price: 500
});

module.exports = Tour;
