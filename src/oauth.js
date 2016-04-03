'use strict';

const querystring = require('querystring');
const randomstring = require('randomstring');

const Signer = require('./signer');
const Utils = require('./utils');

/**
 * OAuth 1.0a signature generator
 *
 * @example <caption>Setup</caption>
 * let OAuth = require('node-oauth-1.0a');
 * let request = require('request');
 *
 * let oauth = new OAuth({
 * 	consumer: {
 * 		public: '<consumer key>',
 * 		private: '<consumer secret>',
 * 	}
 * });
 * let request_data = {
 * 	url: 'https://api.twitter.com/1/statuses/update.json?include_entities=true',
 * 	method: 'POST',
 * 	data: {
 * 		status: 'Hello Ladies + Gentlemen, a signed OAuth request!'
 * 	}
 * };
 * let token = {
 * 	public: '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb',
 * 	secret: 'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE'
 * };
 *
 * @example <caption>Sending in POST body with request library</caption>
 * let formData = Object.assign(
 * 	{},
 * 	request_data.data,
 * 	oauth.authorize(request_data, token)
 * );
 * request({
 * 	url: request_data.url,
 * 	method: request_data.method,
 * 	form: oauth.buildQueryString(formData)
 * }, function(error, response, body) {
 * 	// Process data
 * });
 *
 * @example <caption>Sending in Authorization header with request library</caption>
 * request({
 * 	url: request_data.url,
 * 	method: request_data.method,
 * 	form: oauth.buildQueryString(request_data.data),
 * 	headers: {
 * 		Authorization: oauth.getHeader(request_data, token)
 * 	}
 * }, function(error, response, body) {
 * 	// Process data
 * });
 *
 */
class OAuth{
	/**
	 * @param {Object} opts
	 * @param {Object} opts.consumer Consumer token (required)
	 * @param {string} opts.consumer.public Consumer key (public key)
	 * @param {string} opts.consumer.private Consumer secret
	 * @param {number} [opts.nonce_length=32] Length of nonce (oauth_nonce)
	 * @param {string} [opts.signature_method="HMAC-SHA1"] Signing algorithm
	 * Supported algorithm:
	 * - `HMAC-SHA1`
	 * - `PLAINTEXT`
	 * - `HMAC-SHA256`
	 *
	 * Note that `HMAC-256` is non-standard.
	 * @param {string} [opts.version=1.0] OAuth version (oauth_version)
	 * @param {boolean} [opts.last_ampersand=true] Whether to append trailing
	 * ampersand to signing key
	 */
	constructor(opts){
		opts = opts || {}

		if(!opts.consumer) {
			throw new Error('consumer option is required');
		}

		this._opts = Object.assign({
			nonce_length: 32,
			signature_method: 'HMAC-SHA1',
			version: '1.0',
			last_ampersand: true,
			parameter_seperator: ', ',
		}, opts);
	}

	/**
	 * Sign a string with key
	 * @private
	 * @param {string} str String to sign
	 * @param {string} key HMAC key
	 * @return {string} Signed string in base64 format
	 */
	_sign(str, key){
		if(!this._signer){
			// Cache the signer
			this._signer = this._getSigner(this._opts.signature_method);
		}
		return this._signer(str, key);
	}

	/**
	 * Retrieve a signing algorithm by algorithm name
	 * @private
	 * @param {string} type Algorithm name
	 * @throws {Error} Algorithm is not supported
	 * @return {Function} Algorithm implementation
	 */
	_getSigner(type){
		if(Signer[type]){
			return Signer[type];
		}else{
			let supported = JSON.stringify(Object.keys(Signer));
			throw new Error(`Hash type ${type} not supported. Supported: ${supported}`);
		}
	}

	/**
	 * Create OAuth signing data for attaching to request body
	 * @param {Object} request
	 * @param {string} request.method HTTP Method name (eg. `GET`, `POST`, `PUT`)
	 * @param {string} request.url URL
	 * @param {Object} request.data Post data as a key, value map
	 *
	 * @param {Object} [token={}] User token
	 * @param {string} [token.key] Token public key
	 * @param {string} [token.secret] Token secret key
	 *
	 * @return {Object} OAuth signing data. You probably want to put this in your POST body
	 *
	 * @example
	 * let request = {
	 * 	method: 'POST',
	 * 	url: 'https://api.twitter.com/1.1/statuses/update.json',
	 * 	data: {
	 * 		status: 'Hello, world!'
	 * 	}
	 * };
	 * let token = {
	 * 	public: '<user token>',
	 * 	private: '<user token secret>'
	 * };
	 * let oauth_data = oauth.authorize(request, token);
	 * console.log(oauth_data);
	 *
	 * @example <caption>Example response</caption>
	 * {
	 * 	"oauth_consumer_key": "xvz1evFS4wEEPTGEFPHBog",
	 * 	"oauth_nonce": "kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
	 * 	"oauth_signature_method": "HMAC-SHA1",
	 * 	"oauth_timestamp": 1318622958,
	 * 	"oauth_version": "1.0",
	 * 	"oauth_token": "370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb",
	 * 	"oauth_signature": "tnnArxj06cWHq44gCs1OSKk/jLY="
	 * }
	 */
	authorize(request, token){
		token = token || {};

		let oauth_data = this._getOAuthData(token);
		oauth_data.oauth_signature = this.getSignature(request, token.secret, oauth_data);

		return oauth_data;
	}

	/**
	 * Create OAuth Authorization header
	 * @param {Object} request
	 * @param {string} request.method HTTP Method name (eg. `GET`, `POST`, `PUT`)
	 * @param {string} request.url URL
	 * @param {Object} request.data Post data as a key, value map
	 *
	 * @param {Object} [token={}] User token
	 * @param {string} [token.key] Token public key
	 * @param {string} [token.secret] Token secret key
	 *
	 * @return {string} Authorization header value
	 */
	getHeader(request, token){
		let oauth_data = this.authorize(request, token);
		return Utils.toHeader(oauth_data, this._opts.parameter_seperator);
	}

	/**
	 * Format OAuth signing data for sending via HTTP Header
	 * @param {Object} oauth_data OAuth signing data as returned from
	 * {@link OAuth#authorize}
	 * @return {Object} Headers required to sign the request
	 * @deprecated This method is preserved for backward compatibility with
	 * oauth-1.0a. New implementors should use {@link OAuth#getHeader} instead.
	 */
	toHeader(oauth_data){
	    return {
			Authorization: Utils.toHeader(oauth_data, this._opts.parameter_seperator)
		};
	}

	/**
	 * Create oauth_signature from request. Usually you probably want to use
	 * {@link OAuth#authorize} instead.
	 * @param {Object} request
	 * @param {string} request.method HTTP Method name (eg. `GET`, `POST`, `PUT`)
	 * @param {string} request.url URL
	 * @param {Object} request.data Post data as a key, value map
	 *
	 * @param {Object} [token={}] User token
	 * @param {string} [token.key] Token public key
	 * @param {string} [token.secret] Token secret key
	 *
	 * @param {Object} oauth_data
	 * @param {string} oauth_data.oauth_consumer_key Consumer key
	 * @param {string} oauth_data.oauth_nonce Nonce string
	 * @param {string} oauth_data.oauth_signature_method Signing algorithm name
	 * (only for building signing string, the actual signing algorithm is set by
	 * class {@link OAuth#constructor} arguments)
	 * @param {number} oauth_data.oauth_timestamp Current time in seconds
	 * @param {string} oauth_data.oauth_version OAuth version (should be 1.0)
	 *
	 * @return {string} Value of oauth_signature field
	 */
	getSignature(request, token, oauth_data){
		return this._sign(
			this._getBaseString(request, oauth_data),
			this._getSigningKey(token)
		);
	}

	/**
	 * Create new OAuth data
	 * @private
	 * @param {Object} [token] User token
	 * @param {string} token.public Token public key
	 * @return {Object} OAuth data without oauth_signature
	 *
	 * @example <caption>Example response</caption>
	 * {
	 * 	"oauth_consumer_key": "xvz1evFS4wEEPTGEFPHBog",
	 * 	"oauth_nonce": "kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
	 * 	"oauth_signature_method": "HMAC-SHA1",
	 * 	"oauth_timestamp": 1318622958,
	 * 	"oauth_version": "1.0",
	 * 	"oauth_token": "370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb",
	 * }
	 */
	_getOAuthData(token){
		let oauth_data = {
			oauth_consumer_key: this._opts.consumer.public,
			oauth_nonce: this._getNonce(),
			oauth_signature_method: this._opts.signature_method,
			oauth_timestamp: this._getTimeStamp(),
			oauth_version: this._opts.version
		};

		if(token && token.public){
			oauth_data.oauth_token = token.public;
		}

		return oauth_data;
	}

	/**
	 * Build authorization string to sign.
	 *
	 * An authorization string composes of HTTP method name, base URL and
	 * parameters (both request parameters and OAuth data)
	 * @private
	 * @param {Object} request Request object
	 * @param {Object} oauth_data OAuth parameters
	 * @return {string} Authorization string
	 */
	_getBaseString(request, oauth_data){
		let out = [
			request.method.toUpperCase(),
			Utils.getBaseUrl(request.url),
			Utils.getParameterString(request, oauth_data)
		];

		return out.map(item => Utils.percentEncode(item))
			.join('&');
	}

	/**
	 * Build a query string similar to {@link querystring.encode}, but
	 * escape things correctly per OAuth spec
	 *
	 * @param  {Object} data Object to encode as query string
	 * @return {string} Query string object
	 */
	buildQueryString(data){
		data = Utils.toSortedMap(data);

		return Utils.stringifyQueryMap(data, '&', '=', {
			encodeURIComponent: Utils.percentEncode
		});
	}

	/**
	 * Build signing key.
	 *
	 * A signing key composes of consumer secret and,
	 * optionally, user token secret.
	 *
	 * This method will append trailing ampersand when `token_secret` is unset
	 * if `last_ampersand` constructor option is set.
	 *
	 * @private
	 * @param  {string} [token_secret] User token secret
	 * @return {string} Signing Key
	 */
	_getSigningKey(token_secret){
		let out = [
			this._opts.consumer.secret
		];

		if(this._opts.last_ampersand || token_secret){
			out.push(token_secret || '');
		}

		return out.map(item => Utils.percentEncode(item))
			.join('&');
	}

	/**
	 * Create nonce.
	 *
	 * Nonce is a random string to prevent replaying of requests.
	 *
	 * Default nonce length is 32 characters, and can be specified by
	 * `nonce_length` constructor option.
	 *
	 * @private
	 * @return {string} Nonce string
	 */
	_getNonce(){
		return randomstring.generate({
			length: this._opts.nonce_length || 32,
			charset: 'alphanumeric'
		});
	}

	/**
	 * Create timestamp from current time
	 * @private
	 * @return {number} Current time in seconds
	 */
	_getTimeStamp(){
		return parseInt(new Date().getTime()/1000, 10);
	}
}

module.exports = OAuth;
