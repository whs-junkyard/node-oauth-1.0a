/**
 * Plaintext signing method just returns the key.
 * @param {string} base_string message string
 * @param {string} key         signing key
 */
export function sign(base_string: string, key: string) {
	return key;
}

export default sign; // tslint:disable-line
