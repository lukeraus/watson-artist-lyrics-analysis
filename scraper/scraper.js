const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

/* getAlbums
 * scrapes all albums belonging to an artist
 * artistName - name of artist to scrape lyrics from
 */
exports.getAlbums = (artistName) => {

	let cleanedName = artistName.toLowerCase().split(' ').join(''); //Kanye West -> kanyewest
	//Special Case: Michael Jackson, Kanye West, Justin Timberlake, etc.
	//OUTSIDE OF SPRINT SCOPE: other artists
	//TODO: accented characters like á are ignored
	//TODO: Sometimes you'll have the last name instead of both, ie. /j/jackson instead of /m/michaeljackson
	//bands mind get a "band" appended at the end, ie. U2

	let letterCategory = cleanedName.startsWith("the") ? cleanedName[3] : cleanedName[0];
	let options = {
		url: `https://www.azlyrics.com/${letterCategory}/${cleanedName}.html`,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
		},
		transform: (body) => cheerio.load(body) //middleware applied to quickly be able to parse the html result immediately
	};

	return scrapeAlbums(options, artistName);

	/* scrapeAlbums
	 * in getAlbums, scrapeAlbums does the HTTP request and parsing of the HTML
	 * factored out as a function so it can get called repeatedly when retrying names
	 * requestOptions - params used for the HTTP request
	 * artistName - name of the artist, could be changed based on who called it
	 */
	function scrapeAlbums(requestOptions, artistName) {
		return rp(requestOptions)
			.then(($) => {
				let albums = [];
				let album;
				let albumElements = $("#listAlbum").children().filter("a:not([id]),div.album");
				//array of divs for albums and ahrefs as songs

				albumElements.each((i, element) => {
					if (element.name === 'div') {
						//push the old album if there was one
						if (album) {
							albums.push(album);
						}
						album = {
							albumTitle: $(element).text().split('"')[1],
							songs: []
						};
					}
					if (element.name === 'a') {
						album.songs.push({
							songTitle: $(element).text(),
							url: "https://www.azlyrics.com" + element.attribs.href.slice(2)
						});
					}
				});
				if (album.albumTitle) {
					albums.push(album);
				}

				return albums;
			})
			.catch((err) => {
				//404 test for the case if it's stored by last name and not full name
				let split = artistName.toLowerCase().split(' ');
				let newUrl = "";
				if (split.length > 1) {
					cleanedName = split[1];
					letterCategory = cleanedName.startsWith("the") ? cleanedName[3] : cleanedName[0];
					newUrl = `https://www.azlyrics.com/${letterCategory}/${cleanedName}.html`;
				}
				if (newUrl === requestOptions.url || split.length === 1) {
					return {
						error: "ERROR",
						result: `Artist ${artistName} not found`
					};
				} else {
					requestOptions.url = newUrl;
					return getAlbums(requestOptions, cleanedName);
				}
			});
	}
};


/* getLyricsFromAlbum
 * given an album from getAlbums, scrape lyrics from all songs in album
 * album - object matching schema of
 * 		{
 * 			"albumTitle"
 * 			"songs": {
 * 				"songTitle",
 * 				"url"
 * 			}
 * 		}
 */
exports.getLyricsFromAlbum = (album) => {
	let index = 0;
	let lyricsResults = {};

	return getLyrics();

	function getLyrics() {
		let song = album.songs[index++];

		//if undefined, you're done, so return
		if (!song) {
			return lyricsResults;
		}

		let requestOptions = {
			url: song.url,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
			},
			transform: (body) => cheerio.load(body)
		};
		return rp(requestOptions)
			.then($ => {
				//selects the div that contains all the lyrics
				let rawLyrics = $(".col-xs-12.col-lg-8.text-center div:not([class])").text();
				//applies a regex to strip things like "[CHORUS: ]" and excess newlines
				let cleanedLyrics = rawLyrics.replace(/\[.+\]/g, "").replace(/\n{2,}/g, "");

				//save it into the result object
				lyricsResults[song.songTitle] = cleanedLyrics;
				console.log(`${song.songTitle} ${cleanedLyrics.length}`);

				//wait 5-15 seconds before scraping the next song
				let delay = (Math.random() * 10 + 5) * 1000;
				setTimeout(getLyrics.bind(this, song), delay);
				return lyricsResults;
			})
			.catch(err => {
				throw err;
			});
	}
}


let test = (artist) => {
	exports.getAlbums(artist).then(albums => {
		let album = albums.pop();
		console.log(JSON.stringify(album, null, 4));
		exports.getLyricsFromAlbum(album).then(lyrics => {
			console.log(lyrics);
		});
	});
}

test("coldplay");


//TODO: Figure out how to wait for all time
