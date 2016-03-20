'use strict';

const querystring = require('querystring');
const randomstring = require('randomstring');

const Signer = require('./signer');
const Utils = require('./utils');

class OAuth{
	/**
	 * Constructor
	 * @param {Object} opts consumer key and secret
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
	 * @param {string} String to sign
	 * @param {string} HMAC key
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
	 * Get a signer by algorithm name
	 * @param {string} Algorithm name
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
	 * OAuth request authorize
	 * @param  {Object} request data
	 * {
	 *	 method,
	 *	 url,
	 *	 data
	 * }
	 * @param  {Object} public and secret token
	 * @return {Object} OAuth Authorized data
	 */
	authorize(request, token){
		token = token || {};

		let oauth_data = {
			oauth_consumer_key: this._opts.consumer.public,
			oauth_nonce: this._getNonce(),
			oauth_signature_method: this._opts.signature_method,
			oauth_timestamp: this._getTimeStamp(),
			oauth_version: this._opts.version
		};

		if(token.public){
			oauth_data.oauth_token = token.public;
		}

		if(!request.data){
			request.data = {};
		}

		oauth_data.oauth_signature = this.getSignature(request, token.secret, oauth_data);

		return oauth_data;
	}

	/**
	 * Get OAuth data as Header
	 * @param  {Object} oauth_data
	 * @return {String} Header data key - value
	 */
	toHeader(oauth_data){
	    return {
			Authorization: Utils.toHeader(oauth_data, this._opts.parameter_seperator)
		};
	}

	/**
	 * Create a OAuth Signature
	 * @param  {Object} request data
	 * @param  {Object} token_secret public and secret token
	 * @param  {Object} oauth_data   OAuth data
	 * @return {String} Signature
	 */
	getSignature(request, token_secret, oauth_data){
		return this._sign(
			this._getBaseString(request, oauth_data),
			this._getSigningKey(token_secret)
		);
	}

	/**
	 * Base String = Method + Base Url + ParameterString
	 * @param  {Object} request data
	 * @param  {Object} OAuth data
	 * @return {String} Base String
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
	 * Create a Signing Key
	 * @param  {String} token_secret Secret Token
	 * @return {String} Signing Key
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

	_getNonce(){
		return randomstring.generate({
			length: this._opts.nonce_length || 32,
			charset: 'alphanumeric'
		});
	}

	_getTimeStamp(){
		return parseInt(new Date().getTime()/1000, 10);
	}
}

module.exports = OAuth;
