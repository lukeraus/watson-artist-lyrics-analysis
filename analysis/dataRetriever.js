const fs = require('fs');

const scraper = require('../scraper/scraper.js');
const watsonPersonality = require('./watson_personality.js');
const metadataCollector = require('../scraper/metadataCollector.js');

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
		let scrapedAlbums = await scraper.getAlbums(artistName);
		console.log(`Scraping ${artistName} tracklist: DONE`);

		const scrapedJson = {
			artist: artistName,
			albums: []
		};

		// Get all metadata from Spotify
		console.log('----------');
		const accessToken = await metadataCollector.getAccessToken();
		console.log('Spotify Access Token received');

		const artist = await metadataCollector.getArtistMetadata(artistName, accessToken);
		console.log('Spotify artist metadata received');

		let albumNames = scrapedAlbums.map(albumObj => albumObj.albumTitle);
		albumNames = albumNames.map((albumTitle) => {
			const promise = new Promise(async (resolve) => {
				const albumMetadata = await metadataCollector
					.getAlbumMetadata(albumTitle, artist, accessToken);
				console.log(`Spotify album metadata for ${albumTitle} received`);
				resolve(albumMetadata);
			});
			return promise;
		});
		const albums = await Promise.all(albumNames);
		metadataCollector.checkPrecision(albums);
		console.log('All Spotify album metadata received');

		const metadataJson = { artist, albums };
		const metadataFilename = `./scraper/text/${artistName.toLowerCase().split(' ').join('')}-metadata.json`;
		fs.writeFileSync(metadataFilename, JSON.stringify(metadataJson, null, 4));

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

		// Write to file because 'watsonPersonality.getArtistPersonalityInsights 'reads from a file
		const fileName = `./scraper/text/${artistName.toLowerCase().split(' ').join('')}.json`;
		fs.writeFileSync(fileName, JSON.stringify(scrapedJson, null, 4));

		// Run through personality insights
		await watsonPersonality.getArtistPersonalityInsights(fileName);
		console.log('Personality Insights received');

		// And we oooout
		console.log('DONE');
	} catch (err) {
		throw err;
	}
};


// exports.run('Kanye West');
