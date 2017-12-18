
# Watson Personality Insights of Artist Lyrics [![Build Status](https://travis-ci.org/lukeraus/watson-artist-lyrics-analysis.svg?branch=master)](https://travis-ci.org/lukeraus/watson-artist-lyrics-analysis)
This node application uses Watson Personality insights to anaylize an artist's personality through song lyrics across their career.

Each album's lyrics are analyized separately giving us an insight to an artist's personality in relation to their music across their career. 


# Get Personality Insights
1. Install [nodeJS version 8](https://nodejs.org/en/) 
2. Clone this repo
3. Run `npm install`
4. Make or get a `credentials.json` file and place in the root directory of the project
```
{
  "personalityInsights": {
    "url": "https://gateway.watsonplatform.net/personality-insights/api",
    "username": "xxxxxxxxxxxxxxxx",
    "password": "xxxxxxxx"
  },
  "spotify": {
    "clientId": "xxxxxx",
    "clientSecret": "xxxxxx"
  }
}
```
5. Run `node ./analysis/dataRetriever.js`
6. You will find the artist results under `./anaysis/artists_results`

# Run Locally (Website)
These steps will be used when the project is farther along for now use setps above ^
1. install [nodeJS version 8](https://nodejs.org/en/) 
2. clone this repo 
3. run `npm install`
4. run `npm start`
5. go to http://localhost:6001 to see the website!

# Run Tests
1. run test by calling `npm test`