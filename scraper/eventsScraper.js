const rp = require('request-promise');
const cheerio = require('cheerio');
// const fs = require('fs');

const getLifeEvents = async (artistMetaData) => {
    // format artist name for wikipedia: Kanye West => Kanye_West
    const artistName = artistMetaData.artist.name;
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
    // const albumData = ['808s & Heartbreak', 'Yeezus'];
    const albumData = ['Fearless', '1989']
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
        console.log(lifeEvent);
    } catch (e) {
        console.log(`Error making request to ${options.url}`);
        throw e;
    }
    return null;
};

getLifeEvents({ artist: { name: 'Taylor Swift' } });
// getLifeEvents({ artist: { name: 'Kanye West' } });
