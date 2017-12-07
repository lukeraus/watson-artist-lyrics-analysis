const fs = require('fs');
const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');

const config = JSON.parse(fs.readFileSync('./analysis/credentials.json'));
/* read credentials and create a personality insights object to work with */
const pi = config.personality_insights[0].credentials;
const personalityInsights = new PersonalityInsightsV3({ username: pi.username, password: pi.password, version_date: '2016-10-19' });


exports.getPeronalityInsights = async (artistLyrics, artistName) => {
    personalityInsights.profile({
        text: artistLyrics,
        consumption_preferences: true
    }, (err, response) => {
        if (err) { throw err; }
        const fileName = `./analysis/artists_results/${artistName.toLowerCase().split(' ').join('')}.json`;
        fs.writeFile(fileName, JSON.stringify(response, null, 4), (error) => {
          if (error) throw error;
          console.log(`File completed: ${fileName}`);
        });
    });
  };

const test = async (lyricsJSON) => {
    try {
        const contents = fs.readFileSync(lyricsJSON);
        // Define to JSON type
        const jsonContent = JSON.parse(contents);

        // TODO: get insights on whole album
        // This is just to get the insights on the first song of the first album
        const lyricsToAnalyize = jsonContent.albums[0].songs[0].lyrics;
        await exports.getPeronalityInsights(lyricsToAnalyize, jsonContent.artist);
    } catch (rejectionError) {
        throw rejectionError;
    }
};

test('./scraper/text/justintimberlake.json');
