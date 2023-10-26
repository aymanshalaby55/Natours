const { default: mongoose } = require('mongoose');
const Tour = require('../Models/TourModel'); // handle node models
const APIFeatures = require('../ultis/apifeatures');
// for the most used routs
exports.aliastoptours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingsAverage,-price';
  req.query.fileds = 'name,price,ratingsAverage,difficulty';
  next();
};

exports.GETALLTours = async (req, res) => {
  try {
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
  } catch (err) {
    //? status code is important ot be right
    res.status(404).json({
      status: 'Fail',
      message: err
    });
    console.log(err);
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
