var assert = require('assert');
var request = require('superagent');
var scraper = require('../scraper/scraper.js');

describe('Suite one: Mocha Sanity', () => {
    it('should return -1 when the value is not present', () => {
        assert.equal(-1, [1, 2, 3].indexOf(4));
    });
    it('should return 0 when the value is present', () => {
        assert.equal(0, [1, 2, 3].indexOf(1));
    });
});

describe('Suite two: Basic gets', () => {
    it('Get index', (done) => {
        request.get('http://localhost:6001')
        .end((err, res) => {
            assert.notEqual(res, undefined, err);
            done();
        });
    });
});

describe('Suite three: Scraper test', () => {
    it('getAlbums() gives back a JSON array', async () => {
        try {
            const result = await scraper.getAlbums('Taylor Swift');
            assert.notEqual(undefined, result.length, result);
        } catch (err) {
            throw err;
        }
    });
});
