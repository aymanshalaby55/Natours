const { default: mongoose } = require('mongoose');
const multer = require('multer'); // used to upload data.
const sharp = require('sharp'); // used for resizing images.
const Tour = require('../Models/TourModel'); // handle node models
const CatchAsync = require('./../utils/CatchAsync');
const AppErorr = require('./../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage(); // save photo to buffer.
// filter  data that isn't image.
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppErorr('not Image! upload only images', 400), false);
  }
};

//
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadTourImage = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  {
    name: 'images',
    maxCount: 3
  }
]);

exports.resizeTourImage = CatchAsync(async (req, res, next) => {
  // for the most used routs
  if (!req.files.imageCover || !req.files.images) return next();
  console.log(req.files);
  const imageCoverFilename = `tour-${req.params.id}-${Date.now}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);
  // to update imageCover in our DataBase.
  req.body.imageCover = imageCoverFilename;
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});
exports.aliastoptours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingsAverage,-price';
  req.query.fileds = 'name,price,ratingsAverage,difficulty';
  next();
};

exports.CreateTour = factory.createOne(Tour);

exports.DeleteTour = factory.deleteOne(Tour);

exports.UpdateTour = factory.UpdateOne(Tour);

exports.GetTour = factory.getOne(Tour, { path: 'reviews' });

exports.GETALLTours = factory.getAll(Tour);

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

// tour-within?distance=223/center/-40,45/mi
exports.tourWithin = CatchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(new AppErorr('Please Enter latitutr and longitude'));
  }
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  console.log(lat, lng);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getDistance = CatchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(new AppErorr('Please Enter latitutr and longitude'));
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      distances
    }
  });
});
