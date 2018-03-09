const express = require('express');
const bodyParser = require('body-parser');
const dataRetriever = require('../analysis/dataRetriever.js');
const emailClient = require('./emailClient.js');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// GET method routes
app.get('/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// POST method routes
app.post('/search', function (req, res) {

  console.log('Entering search....');
  console.log('Request: ' + JSON.stringify(req.body));
  if (!req.body || !req.body.search) {
    res.status(400);
    res.send('No data given.  Must be Json formatad as: {"search":"Artist Name"}');
    return;
  }

  let searchTerm = req.body.search;
  console.log('Searching for: ' + searchTerm);
  res.status(404);
  res.send('Could not find: ' + searchTerm + ' in our system. Please enter your email and we will let you know when we have that artist.');
})

app.post('/startDataRetriever', function (req, res) {

  console.log('Entering startDataRetriever....');
  console.log('Request: ' + JSON.stringify(req.body));
  if (!req.body || !req.body.search || !req.body.email) {
    res.status(400);
    res.send('No data given.  Must be Json formatad as: {"search":"Artist Name", "email":"your@email.com"}');
    return;
  }

  let searchTerm = req.body.search;
  let email = req.body.email;
  console.log('Running DataRetriever for: ' + searchTerm);
  res.send('Running... emailing will be sent to: ' + email);
  
  dataRetriever.run(searchTerm).then(function(){
    // Send mail
    console.log('Sending email to: ' + email);
    var mailOptions = {
      from: 'spacejam2042@gmail.com',
      to: email,
      subject: 'Watson Lyrics analyzer done!',
      text: 'Succefully analyized: ' + searchTerm
    };

    emailClient.sendMail(mailOptions);
  });;
  

})

app.listen(port, () => console.log(`Listening on port ${port}`));