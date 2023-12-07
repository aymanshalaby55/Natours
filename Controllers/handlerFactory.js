const AppErorr = require('./../utils/appError');
const CatchAsync = require('./../utils/CatchAsync');
const APIFeatures = require('../utils/apifeatures');

exports.deleteOne = Model =>
  CatchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppErorr('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: null // no data will be returned.
    });
  });

exports.UpdateOne = Model =>
  CatchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(new AppErorr('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  CatchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  CatchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }

    const doc = await query;

    if (!doc) {
      return next(new AppErorr('No Document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  CatchAsync(async (req, res) => {
    // allow nested Get for reviews
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    //! why i don't await for the find qurey itself?
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .paginate()
      .limit();

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      resluts: doc.length,
      data: {
        data: doc
      }
    });
  });
