'use strict';

let expect;

//Node.js
if(typeof(module) !== 'undefined' && typeof(exports) !== 'undefined') {
    expect = require('chai').expect;
    var Signer = require('../../src/signer');
} else { //Browser
    expect = chai.expect;
}

describe("Signing algorithm", function() {
    const key = 'deadbeef';
    const message = 'unittest';

    describe("PLAINTEXT", function() {
        it("should return key as output", function() {
            expect(Signer.PLAINTEXT(message, key)).to.equal(key);
        });
    });
});
