const mongoose = require('mongoose');

const reviweSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'reviwe can not be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    CreatedAt: { type: Date, default: Date.now() },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belon to a auther.']
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belon to a tour.']
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } } // make sure that virtual property appear in the querise.
);

reviweSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

const Review = mongoose.model('Reviwe', reviweSchema);

module.exports = Review;
