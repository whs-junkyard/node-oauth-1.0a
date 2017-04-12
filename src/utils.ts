import * as querystring from "querystring";
import * as url from "url";

/**
 * @private
 */
export namespace Utils {
    /**
     * Escape string according to [OAuth 1.0 section 3.6]{@link https://tools.ietf.org/html/rfc5849#section-3.6}
     * @param {String} str String to encode
     * @return {String} Encoded string
     */
    export function percentEncode(str: string) {
        return encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
            `%${c.charCodeAt(0).toString(16).toUpperCase()}` // tslint:disable-line
        );
    }

    /**
     * Build OAuth Authorization header
     * @param {Object} oauth_data
     * @param {string} [separator=", "] Separator between items
     * @return {String} Authorization header string
     */
    export function toHeader(oauth_data: any, separator?: string) {
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
    }

    /**
     * Build parameter string part of the signing string.
     *
     * Parameter string consists of all request parameters and OAuth data
     * sorted by key alphabetically.
     *
     * @param  {Object} request
     * @param  {Object} oauth_data
     * @return {Object} string Parameter string
     */
    export function getParameterString(request: any, oauth_data: any) {
        let parsedUrl = url.parse(request.url, true);
        let data = Object.assign({}, parsedUrl.query, request.data || {}, oauth_data);
        data = Utils.toSortedMap(data);

        return Utils.stringifyQueryMap(data, '&', '=', {
            encodeURIComponent: Utils.percentEncode
        });
    }

    /**
     * Build query string from {@link Map}
     *
     * This method should be the same as {@link querystring#stringify}
     * but accept a `Map<string, string|Array>` instead of {@link Object}
     *
     * @param {Object} obj Input
     * @param {string} [sep="&"] Separator between items
     * @param {string} [eq="="] Separator between key and value
     * @param {Object} [options]
     * @param {Function} [options.encodeURIComponent=encodeURIComponent]
     * Key and value escaping algorithm
     * @return {string} Query string
     */
    export function stringifyQueryMap(obj: any, sep: string, eq: string, options: any) {
        sep = sep || '&';
        eq = eq || '=';
        options = Object.assign({
            encodeURIComponent: encodeURIComponent
        }, options);

        let out = [];

        for(let item of obj){
            if(!Array.isArray(item[1])) {
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
    }

    /**
     * Strip query string from URL
     *
     * @param  {String} url URL to strip
     * @return {String} Stripped URL
     */
    export function getBaseUrl(url: string) {
        return url.split('?')[0];
    }

    /**
     * Return a ES6 Map with same key/value pairs as object.
     *
     * Iterating over this map would yield key/value pairs in alphabetical
     * order of keys.
     *
     * @param {Object} object Object to sort
     * @return {Map}
     */
    export function toSortedMap(object: any) {
        let keys = Object.keys(object);
        keys.sort();

        let out = new Map();

        for(let key of keys){
            out.set(key, object[key]);
        }

        return out;
    }
}

export default Utils; // tslint:disable-line
