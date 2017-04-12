import signSha1 from "./hmac-sha1";
import signSha256 from "./hmac-sha256";
import signPlaintext from "./plaintext";

export const Signer = Object.freeze<{[key: string]: Function}>({
	'HMAC-SHA1': signSha1,
	'HMAC-SHA256': signSha256,
	'PLAINTEXT': signPlaintext,
});

export default Signer; // tslint:disable-line
export type SignerType = "HMAC-SHA1" | "HMAC-SHA256" | "PLAINTEXT";
