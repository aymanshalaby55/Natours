const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const validator = require('validator');

// create mongoose schema :
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true
      //validate: [validator.isAlpha, 'tour name must contain only characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration']
      //select: false // don't appear
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'must have max size']
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have difficulty'],
      // used to accept specific values
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can be either easy , medium , difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      defult: 4.5,
      min: [1.0, 'Rating must be above 1'],
      max: [5.0, 'Rating must be below 5']
    },
    ratingsQuantity: {
      type: Number,
      defult: 0
    },
    price: {
      type: Number,
      required: true
    },
    priceDiscout: {
      type: Number,
      validate: {
        // val points to price discout
        validator: function(val) {
          // this only point to current document and cannot be used with update
          return val < this.price;
        },
        message: 'discount price should be less than regular price'
      },
      defult: 0
    },
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
    startDates: [Date],
    secretTour: {
      type: Boolean,
      defult: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number] //الافقي والرأسي
    },
    locations: [
      {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number], //الافقي والرأسي
        address: String,
        description: String,
        day: String
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User' // not need to import user model.
      }
    ]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//! when need to use (this) you have to use regular function inseted of arrow function
tourSchema.virtual('duraionWeeks').get(function() {
  // virtual properties do not store in the database
  return this.duration / 7;
});

// Dcoument middleware : pre run before .save and .create
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.post('save', function(doc, next) {
  //console.log(doc);
  next();
});

// any string is start with find.
tourSchema.pre(/^find/, function(next) {
  // this point to the query
  this.find({ secretTour: { $ne: true } });
  next();
});

// Populatwe
tourSchema.pre(/^find/, function(next) {
  // this point to the query
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});
// we have access to every document from the body.
tourSchema.post(/^find/, function(docs, next) {
  // this point to the query
  //console.log(docs);
  next();
});

// Aggregation middleware : return pipline of aggregation operations
tourSchema.pre('aggregate', function(next) {
  // unshift is array method that push elment or front
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //console.log(this);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
