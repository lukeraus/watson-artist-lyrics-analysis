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
    if (!process.argv[2]) {
        console.log('Need a directory to save to');
        process.exit();
    }
    let dir = process.argv[2]
    
    const fetch = db.collection(collectionName).find({}).toArray((err, res) => {
        if (err) throw err;
        for (let data of res) {
            let artistName = data.artist.name;
            delete data._id;
            const fileName = dir + `/${artistName.toLowerCase().split(' ').join('')}.json`;
            console.log('saving: ' + fileName);
            fs.writeFileSync(fileName, JSON.stringify(data, null, 4));
        }
        process.exit();
    });      
 

});