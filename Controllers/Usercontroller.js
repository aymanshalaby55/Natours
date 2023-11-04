const fs = require('fs');

const Users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

exports.GetAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    result: Users.length,
    data: {
      Users
    }
  });
};
exports.CreateUser = (req, res) => {
  const newid = Users[Users.length - 1].id + 1;
  const newUser = Object.assign({ id: newid }, req.body);
  Users.push(newUser);
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(Users),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: Users
        }
      });
    }
  );
};
