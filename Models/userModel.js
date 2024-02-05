const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    required: true,
    type: String,
    minlength: 8,
    select: false
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
  photo: { type: String, default: 'default.jpg' },
  passwordChangedAt: Date,
  passwordResetToken: String,
  expireResetToken: Date,
  active: {
    type: Boolean,
    select: false,
    default: true
  }
});

UserSchema.pre('/^find/', function(next) {
  this.find({ active: true });
  next();
});

UserSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.pre('save', async function(next) {
  // check if password not modified then do nothing
  if (!this.isModified('password')) {
    return next();
  }
  // what is cost of cpu  second argument?
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined; // we need this for validation only
  next();
});

UserSchema.methods.correctPassword = async function(
  LoginPassword,
  HashedPassword
) {
  return await bcrypt.compare(LoginPassword, HashedPassword);
};

UserSchema.methods.PasswordChangedAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

UserSchema.methods.resetPasswordToken = function() {
  // create random token using crypto.
  const resetToken = crypto.randomBytes(32).toString('hex');

  // protect token by encrypting it.
  // save encrypted password in your database.
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //console.log(resetToken, this.passwordResetToken);

  // give expire date for 5m
  this.expireResetToken = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
