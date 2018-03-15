const fs = require('fs');
const _ = require('lodash');
const util = require('util');

const scraper = require('./scraper/scraper.js');
const watsonPersonality = require('./watson_personality.js');
const metadataCollector = require('./scraper/metadataCollector.js');
const outlierDetector = require('./outlierDetector.js');
const eventsScraper = require('./scraper/eventsScraper.js');
const bioScraper = require('./scraper/bioScraper.js');
const toneAnalyzer = require('./toneAnalyzer');
const watsonConversation = require('./watsonConversation');
const Bluebird = require('bluebird');


/* filters events that match up with WCS trained tone intents */
const filterEvents = async (toneResults) => {
  const albums = {};
  const albumKeys = _.keys(toneResults);
  const allReturnSentences = {};
  for(let i = 0; i < albumKeys.length; i++) {
    const emotion = toneResults[albumKeys[i]];
    albums[albumKeys[i]] = emotion;
    allReturnSentences[albumKeys[i]] = [];
    const emotionKeys = _.keys(emotion);
    for(let j = 0; j < emotionKeys.length; j++) {
      const promises = [];
      const accepted = [];
      const analysisList = emotion[emotionKeys[j]];
      for (let k = 0; k < analysisList.length; k++) {
        const analysis = analysisList[k];
        promises.push(watsonConversation.getIntents(analysis.sentence));
      }

      const resolvedPromises = await Promise.all(promises);
      for(let k = 0; k < resolvedPromises.length; k++) {
        const convSentence = resolvedPromises[k];
        if (convSentence.length > 0 && 'intent' in convSentence[0]) {
          const isEqual = convSentence[0].intent.toLowerCase() ===
            analysisList[k].tone_id.toLowerCase();
          if(isEqual) {
            accepted.push(analysisList[k]);
          }
        }
      }
      albums[albumKeys[i]][emotionKeys[j]] = accepted;
    }
  }
  return albums;
};


/* merges events from filter above unfilter, i.e. most important on top */
const priorityMerge = (filter, unfilter) => {
  // get album, emotion pairs
  const indexPair = [];
  _.each(unfilter, (album, albumKey) => {
    _.each(album, (emotion, emotionKey) => {
      indexPair.push([albumKey, emotionKey]);
    });
  });

  // merge both using priority, via union with identity
  _.each(indexPair, (pair) => {
    const sub = filter[pair[0]][pair[1]];
    const all = unfilter[pair[0]][pair[1]];
    const union = _.unionBy(sub, all, 'sentence');
    filter[pair[0]][pair[1]] = union;
  });

  return filter;
};


/* gets the life events for a given artist using personality data */
const getLifeEventsData = async (artistName, artistResults) => {
    const outlierAlbums = await outlierDetector.getOutliers(artistResults);
    let wikiEvents = await eventsScraper.getLifeEvents({'artist': artistName, 'albums': outlierAlbums});
    wikiEvents = _.pickBy(wikiEvents, _.identity);
    const topTones = await toneAnalyzer.getToneEvents(wikiEvents, artistName);
    const unfilteredTones = _.cloneDeep(topTones);
    const filteredTones = await filterEvents(topTones);
    return priorityMerge(filteredTones, unfilteredTones);
};


/* run
 * given an artist name, scrape A-Z lyrics for albums
 * get Spotify metadata
 * get lyrics for albums that are found in spotify (studio albums)
 * write to file
 * run personality insights on it
 */
exports.run = async (artistName) => {
	try {
		// Scrape inital album list from AZLyrics
		// TODO: Don't mutate scrapedAlbums so much
		let scrapedAlbums = await scraper.getAlbums(artistName);
		console.log(`Scraping ${artistName} tracklist: DONE`);

		const scrapedJson = {
			artist: artistName,
			albums: []
		};

		const resultJson = {
			artist: {
				name: artistName,
				metadata: {}
			},
			albums: [],
			lifeEvents: []
		};

		// Get all metadata from Spotify
		console.log('----------');
		const accessToken = await metadataCollector.getAccessToken();
		console.log('Spotify Access Token received');

		const artist = await metadataCollector.getArtistMetadata(artistName, accessToken);
		console.log('Spotify artist metadata received');

		resultJson.artist.metadata = artist;

		const metadataPromises = scrapedAlbums.map((album) => {
			const promise = new Promise(async (resolve) => {
				const albumMetadata = await metadataCollector
					.getAlbumMetadata(album.albumTitle, artist, accessToken);
				console.log(`Spotify album metadata for ${album.albumTitle} received`);
				resolve(albumMetadata);
			});
			return promise;
		});
		const albums = await Promise.all(metadataPromises);

		metadataCollector.checkPrecision(albums);
		console.log(albums.map(album => album.name));
		console.log('All Spotify album metadata received');

		albums.forEach((album, i) => {
			if (!album.errorMessage) {
				resultJson.albums.push({
					title: scrapedAlbums[i].albumTitle,
					metadata: album
				});
			}
		});

		// filtering to Spotify because Spotify returns studio albums, while AZLyrics also does EPs
		scrapedAlbums = scrapedAlbums.filter((scrapedAlbum) => {
			const isOnSpotify = albums.some(album => album.originalName === scrapedAlbum.albumTitle);
			return isOnSpotify;
		});

		// Get lyrics from studio albums
		for (let i = 0; i < scrapedAlbums.length; i++) {
			const album = scrapedAlbums[i];
			const lyrics = await scraper.getLyricsFromAlbum(album); // eslint-disable-line no-await-in-loop, max-len
			const albumLyrics = {
				album: album.albumTitle,
				songs: []
			};
			albumLyrics.songs = Object.keys(lyrics).map(song => ({
				songTitle: song,
				lyrics: lyrics[song]
			}));
			scrapedJson.albums.push(albumLyrics);
			console.log(`Scraping ${album.albumTitle}: DONE`);
		}
		console.log('Scraping albums: DONE');
		console.log('----------');

		// Run through personality insights
		const insights = await watsonPersonality.getArtistPersonalityInsights(scrapedJson);
		insights.forEach((insight, i) => {
			resultJson.albums[i].insights = insight;
		});
		console.log('Personality Insights received');

		// add life events
    const wikiEvents = await getLifeEventsData(artistName, resultJson);
    resultJson.lifeEvents = wikiEvents;

		try {
			// add biography description
			const bio = await bioScraper.getBio(artistName);
			resultJson.bio = bio;
		} catch (e) {
			console.log("Couldn't make a bio");
		}

    console.log(`Final Artist Results: ${JSON.stringify(resultJson, null, 4)}`);
    return resultJson;
	} catch (err) {
		throw err;
	}
};

/* local test--reads from json file in project dir */
// (async function () {
//     const readFile = util.promisify(fs.readFile);
//     let kanye = await readFile(__dirname + '/artists_results/kanyewest.json', 'UTF-8');
//     kanye = JSON.parse(kanye);
//     const wikiEvents = await getLifeEventsData('Kanye West', kanye);
//     kanye.lifeEvents = wikiEvents;
//     const bio = await bioScraper.getBio('Kanye West');
//     kanye.bio = bio;
//     console.log(`Final Artist Results: ${JSON.stringify(kanye, null, 2)}`);
// })();
