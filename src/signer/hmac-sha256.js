'use strict';

const CryptoJS = require('crypto-js');

module.exports = (base_string, key) => {
	return CryptoJS.HmacSHA256(base_string, key).toString(CryptoJS.enc.Base64);
};
