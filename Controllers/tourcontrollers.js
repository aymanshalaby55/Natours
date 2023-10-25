const { default: mongoose } = require('mongoose');
const Tour = require('../Models/TourModel'); // handle node models
// for the most used routs
exports.aliastoptours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fileds = 'name,price,ratingsAverage,difficulty';
  next();
};
class APIFeatures {
  constructor(query, querystr) {
    this.query = query; // tour.find
    this.querystr = querystr; // req.query
  }

  filter() {
    // 1) filter
    const queryobj = { ...this.querystr };
    const ExcludedFileds = ['sort', 'limit', 'page', 'fileds'];
    // delete execluded operations other operations
    ExcludedFileds.forEach(el => delete queryobj[el]);
    let querystr = JSON.stringify(queryobj);
    querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(querystr));
    return this;
  }

  sort() {
    if (this.querystr.sort) {
      // GET ALL FILEDS
      const SortBy = this.querystr.sort.split(',').join(' ');
      this.query = this.query.sort(SortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limit() {
    if (this.querystr.fileds) {
      const fileds = this.querystr.fileds.split(',').join(' ');
      this.query = this.query.select(fileds);
    } else {
      this.query = this.query.select('-__v'); // exclude _v filed
    }
    return this;
  }

  paginate() {
    // 4) Pageination
    const page = this.querystr.page * 1 || 1;
    const limit = this.querystr.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
//? status code is important ot be right
exports.GETALLTours = async (req, res) => {
  try {
    // display string query
    console.log(Tour.find());

    //! why i don't await for the find qurey itself?
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    const Tours = await features;

    res.status(200).json({
      status: 'success',
      resluts: Tours.length,
      data: {
        Tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err
    });
  }
};

//? MongoDB uses a special type of ID called ObjectId
exports.GetTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({
        status: 'Fail',
        message: 'No tour found with that ID'
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err
    });
  }
};

exports.CreateTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: {
        err
      }
    });
  }
};

exports.DeleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      data: tour
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: {
        err
      }
    });
  }
};

exports.UpdateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
