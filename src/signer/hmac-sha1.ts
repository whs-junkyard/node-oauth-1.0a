import * as crypto from "crypto";

/**
 * Sign message
 * @param {string} base_string message string
 * @param {string} key         signing key
 */
export function sign(base_string: string, key: string) {
	return crypto.createHmac('sha1', key).update(base_string).digest('base64')
};

export default sign;
