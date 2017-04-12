var expect;

//Node.js
if(typeof(module) !== 'undefined' && typeof(exports) !== 'undefined') {
    expect = require('chai').expect;
    var OAuth = require('../../');
} else { //Browser
    expect = chai.expect;
}

describe("parameter_separator option", function() {
    describe("default (', ')", function() {
        var oauth = generateTest({
            consumer: {
                public: 'xvz1evFS4wEEPTGEFPHBog',
                secret: 'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw'
            }
        });

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

        it("should be equal to Twitter example", function() {
            expect(oauth.toHeader(oauth.authorize(request, token))).to.have.property('Authorization', 'OAuth oauth_consumer_key="xvz1evFS4wEEPTGEFPHBog", oauth_nonce="kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg", oauth_signature="tnnArxj06cWHq44gCs1OSKk%2FjLY%3D", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1318622958", oauth_token="370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb", oauth_version="1.0"');
        });
    });

    describe("-", function() {
        var oauth = generateTest({
            consumer: {
                public: 'xvz1evFS4wEEPTGEFPHBog',
                secret: 'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw'
            },
            parameter_separator: '-',
        });

        var token = {
            public: '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb',
            secret: 'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE',
        };

        var request = {
            url: 'https://api.twitter.com/1/statuses/update.json?include_entities=true',
            method: 'POST',
            data: {
                status: 'Hello Ladies + Gentlemen, a signed OAuth request!'
            },
        };

        it("header should be correct", function() {
            const authData = oauth.authorize(request, token);
            const authHeader = oauth.toHeader(authData);
            const prop = "Authorization";
            const expectedVal = 'OAuth oauth_consumer_key="xvz1evFS4wEEPTGEFPHBog"-oauth_nonce="kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg"-oauth_signature="tnnArxj06cWHq44gCs1OSKk%2FjLY%3D"-oauth_signature_method="HMAC-SHA1"-oauth_timestamp="1318622958"-oauth_token="370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb"-oauth_version="1.0"';
            expect(authHeader).to.have.property(prop, expectedVal);
        });
    });
});

function generateTest(options) {
    var oauth = new OAuth(options);

    //overide for testing only !!!
    oauth._getTimeStamp = function() {
        return 1318622958;
    };

    //overide for testing only !!!
    oauth._getNonce = function(length) {
        return 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg';
    };

    return oauth;
}
