const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

// uncaught expections : must be defined before any code execution.
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('uncaugh Expection, shuting Down...🔥💣');
  process.exit(1);
});
// Environment variables are a universal mechanism  for conveying configuration
// information to Unix programs. Let's use dotenv package to load environment variables
// from a .env file into process.env
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE;
console.log(process.env.NODE_ENV);

mongoose
  .connect(DB, {
    // what are these doing?
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then(() => {
    console.log('connection with DB is complete');
  })
  .catch(err => {
    console.log(err);
  });

const port = process.env.PORT || 8000;
// save the server
const server = app.listen(port, () => {
  console.log('app is runing on port', port);
});

// unhandled rejection : ex : promises without catch
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('unHandled Expection, shuting Down...🔥💣');
  //close the server to handle process that is still handled
  server.close(() => {
    process.exit(1);
  });
});
