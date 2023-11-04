const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name']
  },
  email: {
    uniqe: true,
    type: String,
    required: [true, 'please write you Email'],
    lowercase: true,
    validate: [validator.isEmail, 'Write a Valid email']
  },
  password: {
    required: true,
    type: String,
    minlength: 8
  },
  confirmPassword: {
    retuired: true,
    type: String,
    validate: {
      // this only works on save
      validator: function(val) {
        return this.password === val;
      },
      message: "password dosn't match"
    }
  },
  photo: String
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
