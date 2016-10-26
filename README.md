# node-oauth-1.0a

OAuth 1.0a Request Authorization for **Node** and **Browser**

Send OAuth request with your favorite HTTP client
([request](https://github.com/mikeal/request),
[jQuery.ajax](http://api.jquery.com/jQuery.ajax/)...) or
[fetch](https://fetch.spec.whatwg.org))

## Breaking change

- v3.0.0
  - Crypto library changed to node's `crypto`
- v2.0.0
  - A bug has been discovered in `authorize`. As it no longer mutate input,
    the input string no longer get escaped correctly per OAuth spec.
    To remedy this:
    - If you build POST body yourself, use the `buildQueryString` method
      instead of `querystring.encode`.
    - Otherwise, make sure that your parameters are encoded with
      `percentEncode` instead of `encodeURIComponent`. It is available at
      `require('node-oauth-1.0a/src/utils').percentEncode`.

## Difference to oauth-1.0a

- The code is broken down to multiple files and rewritten to a subset of ES6.
  - When node and evergreen browsers starts shipping full ES6 support it is
    expected that the code will change to full ES6.
- Use libraries instead of shipping with some common algorithms.
- Large parts of the API are made private
- The public API should be compatible with some changes
  - The constructor must be called with `new`.
  - `authorize` and its inner methods no longer mutate input.
  - `getHeader` with the same signature as `authorize` is added. `toHeader` is
    deprecated
