var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost/test";
const collectionName = 'artist';

MongoClient.connect(url, function(err, client) {
  if (err) throw err;
  console.log('Created test db');
  db = client.db('test');
  
  // drop all in collection
  db.collection(collectionName).drop(function(err, delOK) {
    if (err) throw err;
    if (delOK) console.log('Collection deleted: ' + collectionName);
    process.exit();
  });

});