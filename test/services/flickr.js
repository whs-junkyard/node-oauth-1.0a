var expect  = require('chai').expect;
var Request = require('request');
var OAuth   = require('../../');

describe("Flickr Personal Consumer", function() {
    this.timeout(10000);

    var oauth = new OAuth({
        consumer: {
            public: process.env.FLICKR_CONSUMER_PUBLIC,
            secret: process.env.FLICKR_CONSUMER_SECRET
        },
        signature_method: 'HMAC-SHA1'
    });

    describe.skip("#Request Token", function() {
        var request = {
            url: 'http://www.flickr.com/services/oauth/request_token',
            method: 'POST',
            data: {
                oauth_callback: 'http://www.ddo.me'
            }
        };

        it("should be a valid response", function(done) {
            Request({
                url: request.url,
                method: request.method,
                form: oauth.authorize(request)
            }, function(err, res, body) {
                expect(body).to.be.a('string');

                body = oauth.deParam(body);

                expect(body).to.have.property('oauth_callback_confirmed', 'true');
                expect(body).to.have.property('oauth_token');
                expect(body).to.have.property('oauth_token_secret');

                done();
            });
        });
    });

    describe.skip("#Request Token by Header", function() {
        var request = {
            url: 'http://www.flickr.com/services/oauth/request_token',
            method: 'POST',
            data: {
                oauth_callback: 'http://www.ddo.me'
            }
        };

        it("should be a valid response", function(done) {
            Request({
                url: request.url,
                method: request.method,
                form: request.data,
                headers: oauth.toHeader(oauth.authorize(request))
            }, function(err, res, body) {
                expect(body).to.be.a('string');

                body = oauth.deParam(body);

                expect(body).to.have.property('oauth_callback_confirmed', 'true');
                expect(body).to.have.property('oauth_token');
                expect(body).to.have.property('oauth_token_secret');

                console.log(body);
                console.log('http://www.flickr.com/services/oauth/authorize?oauth_token=' + token.public);

                done();
            });
        });
    });

    /*
        Need to get token from Request Token
        And oauth_verifier after pass authorize on website
    */
    describe.skip("#Access Token", function() {
        //this token get from Request Token
        var token = {
            public: 'get from Request Token',
            secret: 'get from Request Token'
        };

        var request = {
            url: 'http://www.flickr.com/services/oauth/access_token',
            method: 'POST',
            data: {
                oauth_verifier: 'get from Request Token'
            }
        };

        it("should be a valid response", function(done) {
            Request({
                url: request.url,
                method: request.method,
                form: oauth.authorize(request, token)
            }, function(err, res, body) {
                expect(body).to.be.a('string');

                body = oauth.deParam(body);

                expect(body).to.have.property('fullname');
                expect(body).to.have.property('user_nsid');
                expect(body).to.have.property('username');
                expect(body).to.have.property('oauth_token');
                expect(body).to.have.property('oauth_token_secret');

                token.public = body.oauth_token;
                token.secret = body.oauth_token_secret;

                done();
            });
        });
    });

    /*
        Need to get token from Access Token
    */
    describe("#flickr.test.login", function() {
        var token = {
            public: process.env.FLICKR_TOKEN_PUBLIC,
            secret: process.env.FLICKR_SECRET_SECRET
        };

        var request = {
            url: 'http://api.flickr.com/services/rest/?method=flickr.test.login',
            method: 'GET',
            data: {
                api_key: token.public,
                format: 'json'
            }
        };

        it("should be a valid response", function(done) {
            Request({
                url: request.url,
                method: request.method,
                qs: oauth.authorize(request, token)
            }, function(err, res, body) {
                expect(body).to.be.a('string');
                expect(body).to.have.string('jsonFlickrApi');
                done();
            });
        });
    });

    /*
        Need to get token from Access Token
    */
    describe("#flickr.test.null", function() {
        var token = {
            public: process.env.FLICKR_TOKEN_PUBLIC,
            secret: process.env.FLICKR_SECRET_SECRET
        };

        var request = {
            url: 'http://api.flickr.com/services/rest/?method=flickr.test.null',
            method: 'GET',
            data: {
                api_key: token.public,
                format: 'json'
            }
        };

        it("should be a valid response", function(done) {
            Request({
                url: request.url,
                method: request.method,
                qs: oauth.authorize(request, token)
            }, function(err, res, body) {
                expect(body).to.be.a('string');
                expect(body).to.have.string('jsonFlickrApi');
                done();
            });
        });
    });
});
