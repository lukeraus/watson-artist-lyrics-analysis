var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var eventScraper = require('../scraper/eventsScraper.js');

var tone_analyzer = new ToneAnalyzerV3({
  username: '60b9c033-b301-40c4-8cb1-0244cbdf5380',
  password: 'NxgCaMufw5Zk',
  version_date: '2016-05-19'
});

const artistMetaData = {
    "artist": "Taylor Swift",
    "albums" : ["Fearless", "1989"]
};


const wikiResults = await eventScraper.getLifeEvents(artistMetaData);
const toneResults = {};
console.log(wikiResults);
Object.keys(wikiResults).forEach((key) => {        
    const tones = tone_analyzer.tone(
        {
          tone_input: wikiResults[key],
          content_type: 'text/plain'
        },
        function(err, tone) {
        console.log('TONES>>>>>>>');        
        console.log("WikiResults: " + wikiResults[key]);
          if (err) {
            console.log(err);
          } else {
            console.log(JSON.stringify(tone, null, 2));
          }
        }
      );
    toneResults[key] = tones;
});

console.log(toneResults);