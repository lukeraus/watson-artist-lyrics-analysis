const fs = require('fs');
const util = require('util');
const _ = require('lodash');

// map of album statistics by category
const categoryInsightsMap = {};

// outlier count per album
const albumTally = {};

/* adds a {category, albumScore} object to a dictoionary iff the key is new */
const addNewKeys = (dict,key) => {
    dict[key] = (dict[key] != undefined) ? dict[key] : { category : key, albumScores : [] };
};

/* for each of the 25 categories, add the album scores */
const addAlbumScoreToCategory = (album, category, map) => {
    addNewKeys(map, category.name);        
    var currentCategory = map[category.name];
    currentCategory.albumScores.push({album:album.title, score: category.percentile}); 
};

/* represents insights across albums for each category,
 * effecitvely represents svg files as a map */
const getInsightsByCategory = (artistResults) => {
    // create a map of each category which contains (album, categoryScore) pair
    _.forEach(artistResults.albums, (album) => {
        // add top level category -- there are five of them
        _.forEach(album.insights.personality, (trait) => {                 
            addAlbumScoreToCategory(album, trait, categoryInsightsMap);                              
            // add sub categories as well
            _.forEach(trait.children, (subTrait) => {
                addAlbumScoreToCategory(album, subTrait, categoryInsightsMap);         
            });
        });
    });
};

/* initialzes all albums to zero count */
const zeroTally = (artistResults) => {
    _.forEach(artistResults.albums, (album) => albumTally[album.title] = 0);
};

/* Basic stats to count albums that are outliers across all categories */
const countOutliers = (artistResults) => {    
    zeroTally(artistResults);
    // increase the tally for every album that is an outlier
    _.forEach(_.keys(categoryInsightsMap), (key) => {
        const albumScores = categoryInsightsMap[key].albumScores;
        const scores = _.map(albumScores, 'score').slice().sort((a,b) => a - b);  
        
        // statistics for outlier, using 0.75 coeffiecent
        var q1 = scores[Math.floor((scores.length / 4))];
        var q3 = scores[Math.floor((scores.length * (3/4)))];
        var iqr = q3 - q1; 
        var maxValue = q3 + iqr * 0.75;
        var minValue = q1 - iqr * 0.75;    
        var outlierTest = (x) => { return (x > maxValue || x < minValue) };
        var outlierScores = scores.filter(outlierTest);      
        
        // add tally for outliers for this category
        albumScores.forEach((albumScore) => {
            if (outlierScores.includes(albumScore.score)) {
                albumTally[albumScore.album]++;
            }
        });  
    });
};

/* choose those albums that have a count above the average */
const pickTopOutliers = () => {
    // choose only those values above the average count
    var sum = 0; 
    var count = 0;
    _.forEach(_.keys(albumTally), (key) => {
        if(albumTally[key] > 0) {
            count++;
            sum = sum + albumTally[key];
        }
    });
    var avg = sum / count;
    const outlierAlbums = [];
    _.forEach(_.keys(albumTally), (key) => {
        if(albumTally[key] > avg) {
            outlierAlbums.push(key);
        }
    });
    console.log(JSON.stringify(outlierAlbums, null, 2));
    return outlierAlbums;
};

/* load the artisit data from retriever as javascritp object */
const loadArtistResults = async (name) => {
    const path = name.replace(/ /g, '').toLowerCase() + '.json';
    const readFile = util.promisify(fs.readFile);
    const contents = await readFile(`${__dirname}/artists_results/${path}`, 'UTF-8');
    return JSON.parse(contents);
};


/**
 * Given personality insights data for a particular artist, returns a list
 * of albums that are considered "anomalistic", i.e. consistently appear as 
 * outliers across the 25 personality categories.
 * 
 * artistResults: json obj stored in ../analysis/artists_results that 
 * encapsulates all our artist data
 * 
 * return list of anomalistic albums, e.g. ['1989', 'Fearless'] for Taylor Swift
 */
exports.getOutliers = async (artistName) => {    
    const artistResults = await loadArtistResults(artistName);     
    getInsightsByCategory(artistResults);
    countOutliers(artistResults);
    return pickTopOutliers();
};


// quick test for debug
// getOutliers('Taylor Swift');
