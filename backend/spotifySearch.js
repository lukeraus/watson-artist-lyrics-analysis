const fs = require('fs');

const metadataCollector = require('../analysis/scraper/metadataCollector.js');

/* spotifySearch
 * Given an artist name make sure we can get their albums
 */
exports.search = async (artistName) => {
	try {

		// Get all metadata from Spotify
		console.log('-----Check for Artist-----');
		const accessToken = await metadataCollector.getAccessToken();
		console.log('Spotify Access Token received');

		const artist = await metadataCollector.getArtistMetadata(artistName, accessToken);
		console.log('Spotify artist metadata received');
		
		if (artist.errorMessage) {
			console.log('Artist:' + artistName + ' not found on spotify');
			return false;
		} else {
			console.log('Artist found on spotify as: ' +  artist.name);
			return true;
		}
        
	} catch (err) {
		throw err;
	}
};