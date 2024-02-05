const { default: mongoose } = require('mongoose');
const multer = require('multer'); // used to upload data.
const sharp = require('sharp'); // used for resizing images.
const User = require('../Models/userModel');
const CatchAsync = require('./../utils/CatchAsync');
const AppErorr = require('../utils/appError');
const {
  findById,
  findByIdAndUpdate,
  findByIdAndDelete
} = require('../Models/TourModel');
const factory = require('./handlerFactory');

// multer//
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // uplaod file with user id and current timestamp
//     const extention = file.mimetype.split('/')[0];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extention}`);
//   }
// });

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

exports.upLoadUserPhoto = upload.single('photo'); // single : upload only single file

exports.resizeUserPhoto = CatchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.files.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  console.log(req.files.filename);

  await sharp(req.files.buffer)
    .resize(500, 500) // width and higth
    .toFormat('jpeg') // convert all images into jpeg format.
    .jpeg({ quality: 90 }) // control quality
    .toFile(`public/img/users/${req.file.filename}`); // save to this specfic file

  next();
});

const filterObj = (obj, ...allowedFileds) => {
  const newobj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFileds.includes(el)) {
      newobj[el] = obj[el];
    }
  });
  return newobj;
};

exports.GetAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);
// don't update password with this. this rout for admins.
exports.UpdateUser = factory.UpdateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.UpdateMe = CatchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(1);

  // user must not update password here.
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppErorr('this rout is not for updating password!', 404));
  }

  // update user document.
  // filter properties that we want to be change only(email and name).
  const filter = filterObj(req.body, 'name', 'email');
  if (req.file) filter.photo = req.file.filename;

  const UpdateUser = await User.findByIdAndUpdate(req.user.id, filter, {
    new: true,
    runvalidators: true
  });

  console.log(UpdateUser);

  res.status(200).json({
    status: 'success',
    user: UpdateUser
  });
});

exports.deleteUser = CatchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    user: null
  });
});
