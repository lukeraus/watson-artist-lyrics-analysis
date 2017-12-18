const fs = require('fs');
const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
/* read credentials and create a personality insights object to work with */
const config = JSON.parse(fs.readFileSync('./credentials.json')).personalityInsights;
const personalityInsights = new PersonalityInsightsV3({ username: config.username, password: config.password, version_date: '2016-10-19' });

function getInsightsPromise(artistLyrics) {
    return new Promise((resolve, reject) => {
        personalityInsights.profile({
            text: artistLyrics,
            consumption_preferences: true
        }, (err, response) => {
            if (err) reject(err);
            resolve(response);
        });
    });
}

function parseLyricsJSON(lyricsJSON) {
    const albumsAndLyrics = [];
    for (let i = 0; i < lyricsJSON.albums.length; i++) {
        let albumLyricsBuilder = '';
        for (let x = 0; x < lyricsJSON.albums[i].songs.length; x++) {
            albumLyricsBuilder += lyricsJSON.albums[i].songs[x].lyrics;
        }
        albumsAndLyrics.push({
            albumLyrics: albumLyricsBuilder,
            artistName: lyricsJSON.artist,
            albumTitle: lyricsJSON.albums[i].album,
        });
    }
    return albumsAndLyrics;
}

exports.getArtistPersonalityInsights = async (lyricsJSON) => {
    try {
        const albumsAndLyrics = parseLyricsJSON(lyricsJSON);
        const promises = [];

        console.log(`Getting analysis on Artist: ${lyricsJSON.artist}`);
        for (const info of albumsAndLyrics) {
            promises.push(getInsightsPromise(info.albumLyrics, info.artistName, info.albumTitle));
        }

        const personalities = await Promise.all(promises);
        return personalities;
    } catch (rejectionError) {
        throw rejectionError;
    }
};

// exports.getArtistPersonalityInsights('./scraper/text/justintimberlake.json');
