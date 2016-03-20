var expect;

//Node.js
if(typeof(module) !== 'undefined' && typeof(exports) !== 'undefined') {
    expect = require('chai').expect;
    var OAuth = require('../');
} else { //Browser
    expect = chai.expect;
}

describe("Twitter Sample", function() {
    var oauth = new OAuth({
        consumer: {
            public: 'xvz1evFS4wEEPTGEFPHBog',
            secret: 'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw'
        },
        signature_method: 'HMAC-SHA1'
    });

    //overide for testing only !!!
    oauth._getTimeStamp = function() {
        return 1318622958;
    };

    //overide for testing only !!!
    oauth._getNonce = function(length) {
        return 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg';
    };

    var token = {
        public: '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb',
        secret: 'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE'
    };

    var request = {
        url: 'https://api.twitter.com/1/statuses/update.json?include_entities=true',
        method: 'POST',
        data: {
            status: 'Hello Ladies + Gentlemen, a signed OAuth request!'
        }
    };

    describe("#authorize", function() {
        it("should be equal to Twitter example", function() {
            expect(oauth.authorize(request, token)).to.eql({
                oauth_consumer_key: 'xvz1evFS4wEEPTGEFPHBog',
                oauth_nonce: 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg',
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp: 1318622958,
                oauth_version: '1.0',
                oauth_token: '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb',
                oauth_signature: 'tnnArxj06cWHq44gCs1OSKk/jLY='
            });
        });
    });

    describe("#toHeader", function() {
        it("should be equal to Twitter example", function() {
            expect(oauth.toHeader(oauth.authorize(request, token))).to.have.property('Authorization', 'OAuth oauth_consumer_key="xvz1evFS4wEEPTGEFPHBog", oauth_nonce="kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg", oauth_signature="tnnArxj06cWHq44gCs1OSKk%2FjLY%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1318622958", oauth_token="370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb", oauth_version="1.0"');
        });
    });
});
