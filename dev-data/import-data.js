const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../Models/TourModel');
const user = require('./../Models/userModel');
const review = require('./../Models/reviweModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const data = JSON.parse(
  fs.readFileSync(
    'D:/Programming/Backend/NodeJs/Node js codes/Natours/dev-data/data/tours.json',
    'utf-8'
  )
);
const reviews = JSON.parse(
  fs.readFileSync(
    'D:/Programming/Backend/NodeJs/Node js codes/Natours/dev-data/data/reviews.json',
    'utf-8'
  )
);
const users = JSON.parse(
  fs.readFileSync(
    'D:/Programming/Backend/NodeJs/Node js codes/Natours/dev-data/data/users.json',
    'utf-8'
  )
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(data);
    await user.create(users, { validateBefore: false });
    await review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await user.deleteMany();
    await review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
