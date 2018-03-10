var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost/test";
var fs = require('fs');
const collectionName = 'artist';

MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    console.log('Created test db');
    db = client.db('test');
  
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