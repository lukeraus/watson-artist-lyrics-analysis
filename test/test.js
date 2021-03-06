var assert = require('assert');
var request = require('superagent');
var scraper = require('../analysis/scraper/scraper.js');

describe('Suite one: Mocha Sanity', () => {
    it('should return -1 when the value is not present', () => {
        assert.equal(-1, [1, 2, 3].indexOf(4));
    });
    it('should return 0 when the value is present', () => {
        assert.equal(0, [1, 2, 3].indexOf(1));
    });
});

// TODO: fix these Travis tests
// describe('Suite two: Basic gets', () => {
//     it('Get index', (done) => {
//         request.get('http://localhost:3000')
//         .end((err, res) => {
//             assert.notEqual(res, undefined, err);
//             done();
//         });
//     });
// });

// describe('Suite three: Scraper test', () => {
//     it('getAlbums() gives back a JSON array', () => {
//         const artist = 'Kanye West';
//         return scraper.getAlbums(artist).then((result) => {
//             console.log(JSON.stringify(result, null, 2));
//             console.log(result.length);
//             assert.notEqual(undefined, result.length);
//         })
//         .catch((err) => {
//             throw err;
//         });
//     });

//     blatantly failing test. will get resolved the same way we resolve the one above this
//     it('getLyricsFromAlbum() gives back an object', async () => {
//         const album = {
//             albumTitle: 'The 20/20 Experience: 2 Of 2',
//             songs: [
//                 {
//                     songTitle: 'Cabaret',
//                     url: 'https://www.azlyrics.com/lyrics/justintimberlake/cabaret.html'
//                 },
//                 {
//                     songTitle: 'TKO',
//                     url: 'https://www.azlyrics.com/lyrics/justintimberlake/tko.html'
//                 }
//           ]
//         };
//         return scraper.getLyricsFromAlbum(album).then((lyrics) => {
//             console.log(Object.keys(lyrics).length);
//             assert.notEqual(undefined, lyrics);
//         });
//     });
// });

// function pprint(value) {
//     console.log(JSON.parse(value, null, 4));
// }
