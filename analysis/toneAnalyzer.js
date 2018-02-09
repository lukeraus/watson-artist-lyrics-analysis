const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const eventScraper = require('../scraper/eventsScraper');
const _ = require('lodash');
const fs = require('fs');
const Bluebird = require('bluebird');

const toneResults = {};

/* initialize API */
const toneAnalyzer = new ToneAnalyzerV3({
  username: '60b9c033-b301-40c4-8cb1-0244cbdf5380',
  password: 'NxgCaMufw5Zk',
  version_date: '2016-05-19',
  url: 'https://gateway.watsonplatform.net/tone-analyzer/api'
});

/* hardcoded input sample */
const artistOutlierData = {
    artist: 'Taylor Swift',
    albums: ['Fearless', '1989']
};

/* promisify tone api */
const getTonesPromise = async (lifeEvent) => {
    return new Promise((resolve, reject) => {
        toneAnalyzer.tone({
            text: lifeEvent,
            content_type: 'text/plain',
            sentences: true
        }, (err, res) => {
            if (err) reject(err);
            resolve(res);
        });
    });
};

/* add the sentence tones for each outlier album */
const getTones = async (wiki, artistName) => {
    const keys = _.keys(wiki);
    for (const key of keys) {
        toneResults[key] = getTonesPromise(wiki[key]);
    }
    const allResults = await Bluebird.props(toneResults);
    fs.writeFileSync(`${__dirname}/tone_results/${artistName.replace(/ /g, '').toLowerCase()}.json`, JSON.stringify(allResults, null, 4));
};

/**
 * Given, a wiki-map, i.e. outlier albums with associated wikiapedia text
 * returns a list of tones-sentences for the selected wikipedia text as map,
 * where the key is the outlier album and value is the tone sentence data
 * generated by Watson. Writes the results to tone_results sub folder.
 *
 * wikiMap is a structure like
 * {
 *  'Fearless' : 'Text from wikipedia during Taylor's life during Fearless album'
 * }
 *
 * returns tone sentences map
 */
const getToneEvents = async (wikiMap, artistName, topK = 2) => {
    try {
        getTones(wikiMap, artistName);
        return toneResults;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

/**
*
* Test run of Tone Analyzer
*
*/
const run = async (data) => {
  const wikiMap = await eventScraper.getLifeEvents(data);
  getToneEvents(wikiMap, artistOutlierData.artist);
};

// run(artistOutlierData);
