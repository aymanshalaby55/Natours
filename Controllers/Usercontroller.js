const fs = require('fs');
const Users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`));


exports.GetAllUsers = (req, res) => {
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours
        }
    })
};
exports.CreateUser = (req, res) => {
    const newid = tours[Users.length - 1].id + 1;
    const newUser = Object.assign({ id: newid }, req.body);
    tours.push(newtour);
    fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(tours), (err) => {
        res.status(201).json(
            {
                status: 'success',
                data: {
                    tour: newtour
                }
            }
        );
    });
}