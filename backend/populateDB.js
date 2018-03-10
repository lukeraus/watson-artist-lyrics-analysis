var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost/spacejam';
const dbName = 'spacejam'
const collectionName = 'artistResults';

MongoClient.connect(dbUrl, function(err, client) {
  if (err) throw err;
  console.log('Created DB: ' + dbName);
  db = client.db(dbName);  
  
  // argumenet passed
  if (!process.argv[2]){
    console.log('Need a directory to read from');
    process.exit();
  }

  let dir = process.argv[2]
  let fileCount = 0;
  fs.readdirSync(dir).forEach(file => {
    fileCount++;
  });

  console.log('Reading (' + fileCount +  ') files from: ' + dir);
  let proccessCount = 0;
  
  fs.readdirSync(dir).forEach(file => {
    var jsonContent = JSON.parse(fs.readFileSync(dir + file));
    console.log('Read file for: ' + jsonContent.artist.name);

    // See if already in db
    const fetch = db.collection(collectionName).findOne({
      "artist.name": jsonContent.artist.name
    }, (err, res) => {
      if (err) throw err;
      
      // If already in DB don't need to do anything
      if (res) {
        console.log('Already in DB: ' + jsonContent.artist.name);
        proccessCount++;
        if (proccessCount === fileCount){
          // Check if I am done
          process.exit();
        }
      } else {
        // else store artist jsonContent data
        db.collection(collectionName).save(jsonContent, (err, dbRes) => {
          if (err) {
            console.log('error inserting');
            throw err;
          }
          console.log('Successully inserted artit: ' + jsonContent.artist.name);
          proccessCount++;
          // Check if I am done
          if (proccessCount === fileCount){
            process.exit();
          }
        });
      }
    });
  });

});