const express = require('express');
const bodyParser = require('body-parser');
const dataRetriever = require('../analysis/dataRetriever.js');
const emailClient = require('./emailClient.js');
const spotifySearch = require('./spotifySearch.js');

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

  // Set boilerplate response
  res.setHeader('Content-Type', 'application/json');
  let jsonResponse = {
    type: 'DEFAULT',
    message: 'None'
  };

  console.log('Entering search....');
  console.log('Request: ' + JSON.stringify(req.body));

  // No data given
  if (!req.body || !req.body.search) {
    res.status(400);
    jsonResponse.type = 'BAD_REQUEST';
    jsonResponse.message = 'Bad data give. Must be JSON formatad as: {\'search\':\'Artist Name\'}';
    res.send(JSON.stringify(jsonResponse, null, 3));
    return;
  }

  // TODO: search local DB

  // Search spotify to see if artist exists
  let searchTerm = req.body.search;
  console.log('Searching for: ' + searchTerm);
  spotifySearch.search(searchTerm).then(function(found) {
    if (found) {
      res.status(200);
      jsonResponse.type = 'ARTIST_FOUND_NO_WATSON';
      jsonResponse.message = 'Found artist ' + searchTerm + ' on spotify, but Watson has not analyzed their lyrics.' +
        ' Please enter your email and we will let you know when we have that artist.';
      res.send(JSON.stringify(jsonResponse, null, 3));
    } else {
      res.status(404);
      jsonResponse.type = 'ARTIST_NOT_FOUND';
      jsonResponse.message = 'Could not find: ' + searchTerm + ' on spotify. Please try again';
      res.send(JSON.stringify(jsonResponse, null, 3));
    }
  });

})

app.post('/startDataRetriever', function (req, res) {

  // Set boilerplate response
  res.setHeader('Content-Type', 'application/json');
  let jsonResponse = {
    type: 'DEFAULT',
    message: 'None'
  };

  console.log('Entering startDataRetriever....');
  console.log('Request: ' + JSON.stringify(req.body));

  if (!req.body || !req.body.search || !req.body.email) {
    res.status(400);
    jsonResponse.type = 'BAD_REQUEST';
    jsonResponse.message = 'Bad data give. Must be JSON formatad as: {\'search\':\'Artist Name\', \'email\':\'your@email.com\'}}';
    res.send(JSON.stringify(jsonResponse, null, 3));
    return;
  }

  let searchTerm = req.body.search;
  let email = req.body.email;
  console.log('Running DataRetriever for: ' + searchTerm);
  res.status(200);
  jsonResponse.type = 'DATA_RETRIEVER_RUNNING';
  jsonResponse.message = 'Running Watson Lyric Analyizer... email will be sent to: ' + email;
  res.send(JSON.stringify(jsonResponse, null, 3));

  dataRetriever.run(searchTerm).then(function() {
    // TODO: save data to DB
  
    // Send mail
    console.log('Sending email to: ' + email);
    var mailOptions = {
      from: 'spacejam2042@gmail.com',
      to: email,
      subject: 'Watson Lyrics analyzer done!',
      text: 'Succefully analyized: ' + searchTerm
    };

    emailClient.sendMail(mailOptions);
  });
  

})

app.listen(port, () => console.log(`Listening on port ${port}`));