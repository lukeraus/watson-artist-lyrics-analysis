const artistResult = require('./analysis/artists_results/taylorswift.json');
const _ = require('lodash');

var categoryInsightsMap = {};

// create a map of each category which contains (album, categoryScore) pair
artistResult.albums.forEach((album) => {
    album.insights.personality.forEach((trait) => {
        if (categoryInsightsMap[trait.name] == undefined) {
            categoryInsightsMap[trait.name] = {
                category:  trait.name,
                albumScores: []
            };
        }
        var currentCategory = categoryInsightsMap[trait.name];
        currentCategory.albumScores.push({album:album.title, score: trait.percentile});
        // add sub categories as well
        trait.children.forEach((subTrait) => {
            if (categoryInsightsMap[subTrait.name] == undefined) {
                categoryInsightsMap[subTrait.name] = {
                    category:  subTrait.name,
                    albumScores: []
                };
            }
            var currentCategory = categoryInsightsMap[subTrait.name];
            currentCategory.albumScores.push({album:album.title, score: subTrait.percentile});
        });
    });
});


// initialize outlier tally to 0 for each album
const albumTally = {};
artistResult.albums.forEach((album) => {
    albumTally[album.title] = 0;
});

// increase the tally for every outlier
Object.keys(categoryInsightsMap).forEach((key) => {
    const albumScores = categoryInsightsMap[key].albumScores;
    const scores = _.map(albumScores, 'score').slice().sort((a,b) => a - b);

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

// choose only those values above the average count
var sum = 0;
var count = 0;
Object.keys(albumTally).forEach((key) => {
    if(albumTally[key] > 0) {
        count++;
        sum = sum + albumTally[key];
    }
});
var avg = sum / count;
const outlierAlbums = [];
Object.keys(albumTally).forEach((key) => {
    if(albumTally[key] > avg) {
        outlierAlbums.push(key);
    }
});

console.log(JSON.stringify(outlierAlbums, null, 2));
