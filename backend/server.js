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
const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function internalServerError(req, res, err) {
  let jsonResponse = {};
  console.log('Internal error in search: ' + err);
  res.status(500);
  jsonResponse.type = 'SERVER_ERROR';
  jsonResponse.message = 'Intenral Server error'
  res.send(JSON.stringify(jsonResponse, null, 3));
}

// GET method routes
app.get('/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/artistList', (req, res) => {
  console.log('Entering artistList....');
  console.log('Request: ' + JSON.stringify(req.body));

  // Set boilerplate response
  res.setHeader('Content-Type', 'application/json');
  let jsonResponse = {
    type: 'DEFAULT',
    message: 'None'
  };

  const fetch = db.collection(collectionName).find({}).toArray((err, result) => {
    // DB Error
    if (err) {
      internalServerError(req, res, err);
    }

    // Found list
    let artistNameList = [];
    for (let data of result) {
      if (data.artist && data.artist.name) {
        let artistName = data.artist.name;
        artistNameList.push(artistName);
      }
    }
    res.status(200);
    jsonResponse.type = 'ARTIST_LIST';
    jsonResponse.message = artistNameList;
    res.send(JSON.stringify(jsonResponse, null, 3));
  });

}); // end of /artistList

// POST method routes
app.post('/search', function (req, res) {
  console.log('Entering search....');
  console.log('Request: ' + JSON.stringify(req.body));

  // Set boilerplate response
  res.setHeader('Content-Type', 'application/json');
  let jsonResponse = {
    type: 'DEFAULT',
    message: 'None'
  };

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
      internalServerError(req, res, err);
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
      }); // end of spotify search
    }
  }); // end of seach

}); // end of post /search


app.post('/startDataRetriever', function (req, res) {
  console.log('Entering startDataRetriever....');
  console.log('Request: ' + JSON.stringify(req.body));

  // Set boilerplate response
  res.setHeader('Content-Type', 'application/json');
  let jsonResponse = {
    type: 'DEFAULT',
    message: 'None'
  };

  if (!req.body || !req.body.search || !req.body.email) {
    res.status(400);
    jsonResponse.type = 'BAD_REQUEST';
    jsonResponse.message = 'Bad data give. Must be JSON formatad as: {\'search\':\'Artist Name\', \'email\':\'your@email.com\'}}';
    res.send(JSON.stringify(jsonResponse, null, 3));
    return;
  }

  let searchTerm = req.body.search;
  let email = req.body.email;

  // Run dataRetriever async
  dataRetriever.run(searchTerm).then(function(artistResult) {
    // Store inside database
    db.collection(collectionName).save(artistResult, (err, dbRes) => {
      if (err) {
        // In case something goes wrong
        console.log('Error running dataRetriver: ' + err);
        // Send mail failure
        console.log('Sending failure email to: ' + email);
        var mailOptions = {
          from: 'spacejam2042@gmail.com',
          to: email,
          subject: 'Watson Lyrics analyzer failed',
          text: 'Watson could not analyize lyrics for: ' + searchTerm + '. Please try again.'
        };
        emailClient.sendMail(mailOptions);

      } else {
        console.log('Successfully stored artistResults into collection');
        // Send mail success
        console.log('Sending email to: ' + email);
        var mailOptions = {
          from: 'spacejam2042@gmail.com',
          to: email,
          subject: 'Watson Lyrics analyzer done!',
          text: 'Succefully analyized: ' + searchTerm
        };
        emailClient.sendMail(mailOptions);
      }
    });
  }); // end of dataRetriever

  console.log('Running DataRetriever for: ' + searchTerm);
  res.status(200);
  jsonResponse.type = 'DATA_RETRIEVER_RUNNING';
  jsonResponse.message = 'Running Watson Lyric Analyizer... email will be sent to: ' + email;
  res.send(JSON.stringify(jsonResponse, null, 3));

}); // end of post /startDataRetriever

// Start node sever
app.listen(port, () => console.log(`Listening on port ${port}`));
