const nodemailer = require('nodemailer');
const fs = require('fs');
const emailConfig = JSON.parse(fs.readFileSync('./credentials.json')).emailSettings;

var transporter = nodemailer.createTransport(emailConfig);

// var mailOptions = {
//   from: 'spacejam2042@gmail.com',
//   to: 'lukeraus95@gmail.com',
//   subject: 'Sending Email using Node.js',
//   text: 'That was easy!'
// };

exports.sendMail = async (mailOptions) => {
    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}