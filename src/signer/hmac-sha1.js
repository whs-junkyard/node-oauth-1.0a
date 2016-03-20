'use strict';

const CryptoJS = require('crypto-js');

module.exports = (base_string, key) => {
	return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
};
