const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

const getLifeEvents = async (artistMetaData) => {
    // format artist name for wikipedia: Kanye West => Kanye_West 
    let artistName = artistMetaData.artist.name;
    let formattedName = artistName.replace(/ /g, '_');

    // create request options, passing response body to cheerio    
    const options = {
        url: `https://en.wikipedia.org/wiki/${formattedName}`,        
        transform: body => cheerio.load(body)
    };

    let $;
    let albumData = [];    
    let lifeEvent = [];    
    try {
        // wait for wikipedia response
        $ = await rp(options);   
    }

    return 'TODO';
};