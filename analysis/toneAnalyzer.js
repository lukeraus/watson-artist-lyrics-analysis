const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const config = require('../credentials.json').toneAnalyzer;
const eventScraper = require('../scraper/eventsScraper');
const _ = require('lodash');
const fs = require('fs');
const Bluebird = require('bluebird');

const toneResults = {};

/* initialize API */
const toneAnalyzer = new ToneAnalyzerV3({
  username: config.username,
  password: config.password,
  version_date: config.version_date,
  url: config.url
});

/* hardcoded input sample */
const artistOutlierData = {
    artist: 'Taylor Swift',
    albums: ['Fearless', '1989']
};

/* promisify tone api */
const getTonesPromise = async lifeEvent => (
    new Promise((resolve, reject) => {
        toneAnalyzer.tone({
            text: lifeEvent,
            content_type: 'text/plain',
            sentences: true
        }, (err, res) => {
            if (err) reject(err);
            resolve(res);
        });
    })
);

/* add the sentence tones for each outlier album */
const getTones = async (wiki, artistName) => {
    const keys = _.keys(wiki);
    for (const key of keys) {
        toneResults[key] = getTonesPromise(wiki[key]);
    }
    const allResults = await Bluebird.props(toneResults);
    // console.log(JSON.stringify(allResults));
    // fs.writeFileSync(`${__dirname}/tone_results/${artistName.replace(/ /g, '').toLowerCase()}.json`, JSON.stringify(allResults, null, 4));
    return allResults;
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
const getToneEvents = async (wikiMap, artistName) => {
    try {
        const results = await getTones(wikiMap, artistName);

        // get all album names (keys)
        const albums = Object.keys(wikiMap);
        return getTopCategorizedEvents(albums, results);
    } catch (e) {
        console.log(e);
        throw e;
    }
};

/*
*
* Given the album information result from the Tone Analyzer, this function will
* return the top 3 relevant events for each of the top 2 highest rated emotional
* trait.
*
*/
const getTopCategorizedEvents = (albums, results) => {
  const eventsByAlbum = {};

  // Go through each album
  _.each(albums, (album) => {
    // Go to document_tone and look for the top 2 scoring
    const documentEmotionalTones = results[album].document_tone.tone_categories[0].tones;
    const documentTonesList = [];
    const scoreToTones = {};
    eventsByAlbum[album] = {};

    _.each(documentEmotionalTones, (currTone) => {
      const currScore = currTone.score;
      scoreToTones[currScore] = currTone;
      documentTonesList.push(currScore);
    });

    const scores = _(documentTonesList).sortBy().takeRight(2).value();
    const tone1 = scoreToTones[scores[0]];
    const tone2 = scoreToTones[scores[1]];

    // Go through all sentences and choose the top 3 sentences that have the
    // highest score for each tone
    const sentences = results[album].sentences_tone;
    const scoreToSentenceIdTone1 = {};
    const scoreToSentenceIdTone2 = {};
    const scoresTone1 = [];
    const scoresTone2 = [];
    const scoresToSentenceTone1 = {};
    const scoresToSentenceTone2 = {};

    _.each(sentences, (sentence) => {
      const sentenceId = sentence.sentence_id;
      const sentenceTones = sentence.tone_categories[0].tones;

      // Tone 1
      let toneDetails = _.find(sentenceTones, o => o.tone_id === tone1.tone_id);
      let currScore = toneDetails.score;
      scoresToSentenceTone1[currScore] = toneDetails;
      scoreToSentenceIdTone1[currScore] = sentenceId;
      scoresTone1.push(currScore);

      // Tone 2
      toneDetails = _.find(sentenceTones, o => o.tone_id === tone2.tone_id);
      currScore = toneDetails.score;
      scoresToSentenceTone2[currScore] = toneDetails;
      scoreToSentenceIdTone2[currScore] = sentenceId;
      scoresTone2.push(currScore);
    });

    // find the top 3 of each tone low to high
    const top3Tone1Score = _(scoresTone1).sortBy().takeRight(3).value();
    // const topTone1Score = _.filter(scoresTone1, (score) => {
    //  return score  > 0.5;
    // })
    const top3Tone2Score = _(scoresTone2).sortBy().takeRight(3).value();
    // const topTone2Score = _.filter(scoresTone2, (score) => {
    //  return score  > 0.5;
    // })

    // Tone 1
    eventsByAlbum[album][tone1.tone_id] = [];
    _.each(top3Tone1Score, (toneScore) => {
    // _.each(topTone1Score, (toneScore) => {
      const sentenceDetails = scoresToSentenceTone1[toneScore];
      sentenceDetails.sentence = sentences[scoreToSentenceIdTone1[toneScore]].text;
      eventsByAlbum[album][tone1.tone_id].push(sentenceDetails);
    });

    // Tone 2
    eventsByAlbum[album][tone2.tone_id] = [];
    _.each(top3Tone2Score, (toneScore) => {
    //_.each(topTone2Score, (toneScore) => {
      const sentenceDetails = scoresToSentenceTone2[toneScore];
      sentenceDetails.sentence = sentences[scoreToSentenceIdTone2[toneScore]].text;
      eventsByAlbum[album][tone2.tone_id].push(sentenceDetails);
    });
  });

  // console.log(JSON.stringify(eventsByAlbum));
  return eventsByAlbum;
};

exports.getToneEvents = getToneEvents;


/**
*
* Test run of Tone Analyzer
*
*/
// const run = async (data) => {
//   const wikiMap = await eventScraper.getLifeEvents(data);
//   getToneEvents(wikiMap, artistOutlierData.artist);
// };

// run(artistOutlierData);
