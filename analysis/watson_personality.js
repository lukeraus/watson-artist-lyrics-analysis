const fs = require('fs');
const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');

/* read credentials and create a personality insights object to work with */
const config = JSON.parse(fs.readFileSync('./analysis/credentials.json'));
const personalityInsights = new PersonalityInsightsV3({ username: config.username, password: config.password, version_date: '2016-10-19' });


exports.getPeronalityInsights = async (artistLyrics, artistName, albumTitle) => {
    personalityInsights.profile({
        text: artistLyrics,
        consumption_preferences: true
    }, (err, response) => {
        if (err) { throw err; }
        const albumTitleCompress = albumTitle.toLowerCase().split(' ').join('').replace('/', '-');
        const artistNameCompress = artistName.toLowerCase().split(' ').join('');
        const albumDir = `./analysis/artists_results/${artistNameCompress}`;
        if (!fs.existsSync(albumDir)) {
            fs.mkdirSync(albumDir);
        }
        const fileName = `./analysis/artists_results/${artistNameCompress}/${albumTitleCompress}.json`;
        fs.writeFile(fileName, JSON.stringify(response, null, 4), (error) => {
          if (error) throw error;
          console.log(`File completed: ${fileName}`);
        });
    });
};

const test = async (lyricsFileJSON) => {
    try {
        const contents = fs.readFileSync(lyricsFileJSON);
        // Define to JSON type
        const lyricsJSON = JSON.parse(contents);

        console.log(`Getting analysis on Artist: ${lyricsJSON.artist}`);
        for (let i = 0; i < lyricsJSON.albums.length; i++) {
            const albumTitle = lyricsJSON.albums[i].album;
            let albumLyrics = '';
            for (let x = 0; x < lyricsJSON.albums[i].songs.length; x++) {
                albumLyrics += lyricsJSON.albums[i].songs[x].lyrics;
            }
            console.log(`Getting analysis on album: ${albumTitle}`);
            exports.getPeronalityInsights(albumLyrics, lyricsJSON.artist, albumTitle);
        }
    } catch (rejectionError) {
        throw rejectionError;
    }
};

test('./scraper/text/justintimberlake.json');
