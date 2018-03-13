const rp = require('request-promise');
const cheerio = require('cheerio');

/**
 *  Finds a simple bio of the selected artist from their Wikipedia article.
*/
const getBio = async (artistName) => {
    // format artist name for wikipedia: Kanye West => Kanye_West
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
    try {
        // wait for wikipedia response
        $ = await rp(options);

        const bioParagraphs = $('table[class="infobox biography vcard"]');
        // console.log(bioParagraphs.next().text());
        // console.log(bioParagraphs.next().next().text());
        return [bioParagraphs.next().text(), bioParagraphs.next().next().text()];
    } catch (e) {
        console.log(`Error making request to ${options.url}`);
        throw e;
    }
};

// getBio('Kanye West');
