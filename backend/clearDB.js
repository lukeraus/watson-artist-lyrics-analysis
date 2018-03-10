var MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost/spacejam';
const dbName = 'spacejam'
const collectionName = 'artistResults';

MongoClient.connect(dbUrl, function(err, client) {
  if (err) throw err;
  console.log('Created DB:' + dbName);
  db = client.db(dbName);
  
  // drop all in collection
  db.collection(collectionName).drop(function(err, delOK) {
    if (err) throw err;
    if (delOK) console.log('Collection deleted: ' + collectionName);
    process.exit();
  });

});