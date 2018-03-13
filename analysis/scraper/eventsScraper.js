const rp = require('request-promise');
const cheerio = require('cheerio');

/**
 *  Given data containing the name of an artist along with
 *  a list outlier albums, index into wikipedia webpage to
 *  extract relevant text containing those life periods.
 *
 *  artistOutlierData has the following schema
 *   {
 *       "artist": "Taylor Swift",
 *       "albums" : ["Fearless", "1989"]
 *   }
 *
 *  returns a dictionary that maps representing {album, lifeEvent} pair, i.e.
 *  each album is a key and the value is wiki text about the artist's life during
 *  the time of the album.
*/
exports.getLifeEvents = async (artistOutlierData) => {
    // format artist name for wikipedia: Kanye West => Kanye_West
    const artistName = artistOutlierData.artist;
    const formattedName = artistName.replace(/ /g, '_');

    // create request options, passing response body to cheerio
    const options = {
        url: `https://en.wikipedia.org/wiki/${formattedName}`,
        headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
		},
        transform: body => cheerio.load(body)
    };

    let $;
    const albumData = artistOutlierData.albums;
    const lifeEvent = {};
    try {
        // wait for wikipedia response
        $ = await rp(options);
        for (let i = 0; i < albumData.length; i++) {
          const formattedAlbum = `_${albumData[i].replace(/ /g, '_')}`;
          const sectionName = $('div[id="toc"]').children()
            .find(`a[href *="${formattedAlbum}"]`).children()
            .next()
            .text();
          const formattedSectionName = sectionName.replace(/ /g, '_');
          let albumInfo = $(`span[id="${formattedSectionName}"]`).parent();
          let lifeEventForAlbum = '';
          do {
            if (albumInfo[0].name === 'p') {
              lifeEventForAlbum += albumInfo.text();
            }
            albumInfo = albumInfo.next();
          } while (albumInfo[0].name !== 'h3');

          lifeEvent[albumData[i]] = lifeEventForAlbum;
        }
        return lifeEvent;
    } catch (e) {
        console.log(`Error making request to ${options.url}`);
        throw e;
    }
};
