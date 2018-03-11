const express = require('express');
const bodyParser = require('body-parser');
const dataRetriever = require('../analysis/dataRetriever.js');
const emailClient = require('./emailClient.js');
const spotifySearch = require('./spotifySearch.js');
const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost/spacejam';
const dbName = 'spacejam'
const collectionName = 'artistResults';
var db;

/* start the server after we connect to database */
MongoClient.connect(dbUrl, (err, client) => {
  if (err) throw err;
  console.log('Created spacejam database');
  db = client.db(dbName);
}); // end of mongo client



/* express routes and listen */
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
 

  // Search DB to see if artist exists
  let searchTerm = req.body.search;
  const query = { "artist.name": searchTerm };
  db.collection(collectionName).findOne(query, (err, storedArtist) => {
    console.log(`in collection ${collectionName} result: ${storedArtist}`);

    // For DB error
    if (err) {
      res.status(500);
      jsonResponse.type = 'SERVER_ERROR';
      jsonResponse.message = 'Server error'
      res.send(JSON.stringify(jsonResponse, null, 3));
    }

    // Send back artist result if found in DB
    if (storedArtist) {
      delete storedArtist._id;
      console.log(`Sending Stored Artists: ${JSON.stringify(storedArtist.artist.name)}`);
      res.status(200);
      jsonResponse.type = 'ARTIST_FOUND';
      jsonResponse.message = storedArtist;
      res.send(JSON.stringify(jsonResponse, null, 3));
      return;
      
    } else {
      // if not in DB, look on spotify
      console.log('artist not found in db');
      console.log('Searching spotify for: ' + searchTerm);
      spotifySearch.search(searchTerm).then(function(found) {
        if (found) {
          res.status(200);
          jsonResponse.type = 'ARTIST_FOUND_NO_WATSON';
          jsonResponse.message = 'Found artist ' + searchTerm +
            ' on spotify, but Watson has not analyzed their lyrics.' +
            ' Please enter your email and we will let you know when we have that artist.';
          res.send(JSON.stringify(jsonResponse, null, 3));
        } else {
          res.status(404);
          jsonResponse.type = 'ARTIST_NOT_FOUND';
          jsonResponse.message = 'Could not find: ' + searchTerm + ' on spotify. Please try again';
          res.send(JSON.stringify(jsonResponse, null, 3));
        }
      });
    }
  }); // end of seach

}); // end of post /search


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

  dataRetriever.run(searchTerm).then(function(artistResult) {
    // Store inside database
    db.collection(collectionName).save(artistResult, (err, dbRes) => {
      if (err) {
        console.log('Error storting artistResults into collection');
        throw err;
      }
      console.log('Successfully stored artistResults into collection');        
    });

    // Send mail
    console.log('Sending email to: ' + email);
    var mailOptions = {
      from: 'spacejam2042@gmail.com',
      to: email,
      subject: 'Watson Lyrics analyzer done!',
      text: 'Succefully analyized: ' + searchTerm
    };
    emailClient.sendMail(mailOptions);
  }); // end of dataRetriever

}); // end of post /startDataRetriever

// Start node sever
app.listen(port, () => console.log(`Listening on port ${port}`));
