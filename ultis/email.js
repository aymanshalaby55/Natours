const nodemailer = require('nodemailer');

const sendEmail = async options => {
  //create transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // define email options
  const mailOptions = {
    from: 'aymanshalaby539@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  //send email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
