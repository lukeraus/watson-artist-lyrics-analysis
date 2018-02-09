const fs = require('fs');
const _ = require('lodash');

const scraper = require('../scraper/scraper.js');
const watsonPersonality = require('./watson_personality.js');
const metadataCollector = require('../scraper/metadataCollector.js');
const outlierDetector = require('./outlierDetector.js');
const eventsScraper = require('../scraper/eventsScraper.js');
const toneAnalyzer = require('./toneAnalyzer');


const getLifeEventsData = async (artistName) => {    
    const outlierAlbums = await outlierDetector.getOutliers(artistName);        
    const wikiMap = await eventsScraper.getLifeEvents({'artist': artistName, 'albums': outlierAlbums});      
    return await toneAnalyzer.getToneEvents(wikiMap, artistName);
};

getLifeEventsData('Kanye West');

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

		const fileName = `./analysis/artists_results/${artistName.toLowerCase().split(' ').join('')}.json`;
		fs.writeFileSync(fileName, JSON.stringify(resultJson, null, 4));

		// And we oooout
		console.log('DONE');
	} catch (err) {
		throw err;
	}
};


// exports.run(process.argv[2] || 'Taylor Swift');
