'use strict';

const querystring = require('querystring');
const url = require('url');

const Utils = {
	/**
	 * Percent Encode
	 * @param  {String} str
	 * @return {String} percent encoded string
	 */
	percentEncode: (str) => {
		return querystring.escape(str)
			.replace(/\!/g, "%21")
			.replace(/\*/g, "%2A")
			.replace(/\'/g, "%27")
			.replace(/\(/g, "%28")
			.replace(/\)/g, "%29");
	},

	/**
	 * Get OAuth data as Header
	 * @param  {Object} oauth_data
	 * @param  {string} Separator between items, defaults to ", "
	 * @return {String} Header data key - value
	 */
	toHeader: (oauth_data, separator) => {
		separator = separator || ', ';
		oauth_data = Utils.toSortedMap(oauth_data);

		let params = [];

		// encode each items as key="value"
		for(let item of oauth_data){
			let key = Utils.percentEncode(item[0]);
			let value = Utils.percentEncode(item[1]);
			params.push(`${key}="${value}"`);
		}

		let joinedParams = params.join(separator);

		return `OAuth ${joinedParams}`;
	},

	/**
	 * Get data from url
	 * -> merge with oauth data
	 * -> percent encode key & value
	 * -> sort
	 *
	 * @param  {Object} request data
	 * @param  {Object} OAuth data
	 * @return {Object} Parameter string data
	 */
	getParameterString: (request, oauth_data) => {
		let parsedUrl = url.parse(request.url, true);
		let data = Object.assign({}, parsedUrl.query, request.data, oauth_data);
		data = Utils.toSortedMap(data);

		return Utils.stringifyQueryMap(data, '&', '=', {
			encodeURIComponent: Utils.percentEncode
		});
	},

	/**
	 * Encode
	 *
	 * This method should be the same as querystring.stringify
	 * but accept a Map<string, string|Array> instead of Object
	 *
	 * @param {Map<string, string|Array>} Input
	 * @param {string} Separator between items, default to &
	 * @param {string} Separator between key and value, default to =
	 * @param {Object} Options. Supported are encodeURIComponent to change URL
	                   encoding algorithm.
	 * @return {string} Query string
	 */
	stringifyQueryMap: (obj, sep, eq, options) => {
		sep = sep || '&';
		eq = eq || '=';
		options = Object.assign({
			encodeURIComponent: querystring.escape
		}, options);

		let out = [];

		for(let item of obj){
			if(!Array.isArray(item[1])){
				item[1] = [item[1]];
			}
			item[1].sort();

			let key = options.encodeURIComponent(item[0]);
			for(let value of item[1]){
				// if value is an array, repeat the key multiple time
				value = options.encodeURIComponent(value);
				out.push(`${key}${eq}${value}`);
			}
		}

		return out.join(sep);
	},

	/**
	 * Strip query string from URL
	 *
	 * @param  {String} URL to strip
	 * @return {String} Stripped URL
	 */
	getBaseUrl: (url) => {
		return url.split('?')[0];
	},

	/**
	 * Return a ES6 Map with same key/value pairs as object.
	 *
	 * The pairs insertion order is sorted by key, so iterators would yield
	 * pairs in the same sequence.
	 * Normal object does not guaranteed any iteration order, so it cannot be
	 * used.
	 *
	 * @param {Object} Object to sort
	 * @return {Map} Result
	 */
	toSortedMap: (object) => {
		let keys = Object.keys(object);
		keys.sort();

		let out = new Map();

		for(let key of keys){
			out.set(key, object[key]);
		}

		return out;
	},
};

module.exports = Utils;
