var assert = require('assert');
var expect = require('expect.js');
var request = require('superagent');


describe('Suite one: Mocha Sanity', function(){
    it('should return -1 when the value is not present', function() {
        assert.equal(-1, [1,2,3].indexOf(4));
    });
    it('should return 0 when the value is present', function() {
        assert.equal(0, [1,2,3].indexOf(1));
    });
});

describe('Suite two: Basic gets', function(){
    it ('Get index', function(done){
        request.get('http://localhost:6001')
        .end((err, res) => {
            assert.equal(err, undefined, err);
            done();
        });
    });
});