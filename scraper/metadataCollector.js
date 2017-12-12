const fs = require('fs');
const rp = require('request-promise');

const config = JSON.parse(fs.readFileSync('./credentials.json')).spotify;

const metadataTypes = {
	ARTIST: 'artist',
	ALBUM: 'album'
};

// User needs an access token every hour that the API is used
// Just be lazy and call it every node session, it's not a big deal
// Get the token, store it, and then pass the token into all your spotify api calls
exports.getAccessToken = async () => {
	try {
		const buffer = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
		const getAccessTokenOptions = {
			method: 'POST',
			url: 'https://accounts.spotify.com/api/token',
			headers: {
				Authorization: `Basic ${buffer}`
			},
			form: {
				grant_type: 'client_credentials'
			},
			json: true
		};

		const tokenResult = await rp(getAccessTokenOptions);
		const accessToken = tokenResult.access_token;
		return accessToken;
	} catch (err) {
		throw err;
	}
};

// abstracted out request GET to make getArtistMetadata and getAlbumMetadata
const getMetadata = async (query, queryType, accessToken) => {
	try {
		const requestOptions = {
			url: 'https://api.spotify.com/v1/search',
			headers: {
				Authorization: `Bearer ${accessToken}`
			},
			qs: {
				q: query,
				type: queryType
			},
			json: true
		};

		const searchResult = await rp(requestOptions);
		return searchResult[`${queryType}s`].items;
	} catch (err) {
		throw err;
	}
};

exports.getArtistMetadata = async (artistName, accessToken) => {
	try {
		const artists = await getMetadata(artistName, metadataTypes.ARTIST, accessToken);
		return artists[0];
	} catch (err) {
		return {
			errorMessage: `ERROR: Exception throw when querying '${artistName}'`,
			exception: err.toString()
		};
	}
};

exports.getAlbumMetadata = async (albumName, artist, accessToken) => {
	try {
		// querying search only gives a watered down version of the album metadata
		// so you have to get the ID from this simplified version and then requery it
		// from the /albums endpoint to get all the metadata
		const albumResults = await getMetadata(albumName, metadataTypes.ALBUM, accessToken);
		const simplifiedAlbum = albumResults.filter((album) => {
			// look through albums, filter out any of those where at least one of the artists isn't it
			const hasArtist = album.artists
				.filter(albumArtist => albumArtist.id === artist.id)
				.length > 0;
			return hasArtist;
		})[0];
		if (!simplifiedAlbum) {
			return {
				errorMessage: `ERROR: No results found for ${albumName} by ${artist.name}`,
				name: albumName,
				artist: artist.name
			};
		}
		const albumId = simplifiedAlbum.id;
		const requestOptions = {
			url: `https://api.spotify.com/v1/albums/${albumId}`,
			headers: {
				Authorization: `Bearer ${accessToken}`
			},
			json: true
		};
		const album = await rp(requestOptions);
		return album;
	} catch (err) {
		return {
			errorMessage: `ERROR: Exception thrown when querying '${albumName}'`,
			exception: err.toString()
		};
	}
};

// Spotify sometimes gives back release dates by:
// year ('1973'), month-year('12-1963' or dd-mm-yy('12-14-1963))
// checkPrecision should be called after getting the albums back
// so that the developer is aware of any possible holes in data
exports.checkPrecision = (albums) => {
	const warningAlbums = albums.filter((album) => {
		const hasWarning = album.errorMessage || album.release_date_precision !== 'day';
		if (album.release_date_precision !== 'day') {
			console.log(`WARNING: Album ${album.name}'s release date(${album.release_date}) is of precision ${album.release_date_precision}`);
		}
		if (album.errorMessage) {
			console.log(`ERROR: Album ${album.name} errored because '${album.errorMessage}'`);
		}
		return hasWarning;
	});
	return warningAlbums;
};


const test = async (artistName) => {
	const accessToken = await exports.getAccessToken();
	console.log(accessToken);
	const artist = await exports.getArtistMetadata(artistName, accessToken);
	console.log(artist.name);
	let albumNames = ['NOt his album thoo', 'Graduation'];

	albumNames = albumNames.map((albumTitle) => {
		const promise = new Promise(async (resolve, reject) => {
			try {
				const albumMetadata = await exports.getAlbumMetadata(albumTitle, artist, accessToken);
				resolve(albumMetadata);
			} catch (err) {
				reject(err);
			}
		});
		return promise;
	});
	const albums = await Promise.all(albumNames);
	console.log(JSON.stringify(albums, null, 4));
	exports.checkPrecision(albums);
};

test('Kanye West');
