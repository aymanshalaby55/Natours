const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

// Environment variables are a universal mechanism  for conveying configuration
// information to Unix programs. Let's use dotenv package to load environment variables
// from a .env file into process.env
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    // what are these doing?
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then(() => {
    console.log('connection with DB is complete');
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('app is runing on port', port);
});
