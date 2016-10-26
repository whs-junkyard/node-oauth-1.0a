'use strict';

const crypto = require('crypto');

module.exports = (base_string, key) => {
	return crypto.createHmac('sha256', key).update(base_string).digest('base64')
};