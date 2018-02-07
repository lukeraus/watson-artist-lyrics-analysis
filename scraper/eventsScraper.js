const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

/* TASKS
    1) Find outliers in DataRetriever
    2) Get album/year for those outliers    

    3) Index wikipedia using cheerio to get life-events of relevant album/year
    4) Call tone analyzer and return results. 
    5) (optional) Fine tuning (potentially our own model)
*/

const getLifeEvents = async (artistMetaData) => {
    // format artist name for wikipedia: Kanye West => Kanye_West 
    let artistName = artistMetaData.artist.name;
    let formattedName = artistName.replace(/ /g, '_');

    // create request options, passing response body to cheerio    
    const options = {
        url: `https://en.wikipedia.org/wiki/${formattedName}`,  
        headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
		},      
        transform: body => cheerio.load(body)
    };

    let $;
    let albumData = [];    
    let lifeEvent = [];    
    try {
        // wait for wikipedia response
        $ = await rp(options);   
        // put the predicate     
        console.log($()); 
    } catch(e) {
        console.log(`Error making request to ${options.url}`)
        throw e;
    }

    return  null;
};

getLifeEvents({artist:{ name: "Kanye West" }, relevantAlbums: ['808s']});