const { default: mongoose } = require('mongoose');
const Tour = require('../Models/TourModel'); // handle node models
const APIFeatures = require('../ultis/apifeatures');
// handle  async functions errors
const CatchAsync = require('./../ultis/CatchAsync');
const AppErorr = require('./../ultis/appError');
// for the most used routs
exports.aliastoptours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingsAverage,-price';
  req.query.fileds = 'name,price,ratingsAverage,difficulty';
  next();
};

exports.CreateTour = CatchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      newTour
    }
  });
});

exports.GETALLTours = CatchAsync(async (req, res) => {
  //! why i don't await for the find qurey itself?
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .paginate()
    .limit();
  const Tours = await features.query;

  res.status(200).json({
    status: 'success',
    resluts: Tours.length,
    data: {
      Tours
    }
  });
});

//? MongoDB uses a special type of ID called ObjectId
exports.GetTour = CatchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppErorr('No Tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.DeleteTour = CatchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppErorr('No Tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: tour
  });
});

exports.UpdateTour = CatchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) {
    return next(new AppErorr('No Tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});
// aggregate function
exports.getTourStatus = CatchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: '$difficulty', // aggregate tours togather for specific field
        num: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        AVG: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    },
    {
      $match: { _id: { $ne: 'easy' } } // filtering to not equal
    }
  ]);

  res.status(200).json({
    status: 'Success',
    message: stats
  });
});

exports.GetMonthlyPlan = CatchAsync(async (req, res, next) => {
  const years = req.params.year * 1;

  const tours = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${years}-01-01`),
          $lte: new Date(`${years}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // group the months
        Tours_num: { $sum: 1 },
        Tours: { $push: '$name' } // push return array of matched fields
      }
    },
    {
      // don't save in DB
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        // take 0 or 1 : 0->don't show , 1 show
        _id: 0
      }
    },
    {
      $sort: { Tours_num: -1 }
    },
    {
      $limit: 12
    }
  ]);
  res.status(200).json({
    status: 'Success',
    message: tours
  });
});
