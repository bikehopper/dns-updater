import p from 'phin';
import { URL } from 'node:url';

export default class CloudflareClient {
  #bearerToken;
  #client;
  #defaultOptions = {
    parse: 'json',
    core: {
      headers: {
        'Authorization': `Bearer ${this.#bearerToken}`,
        'Content-Type': 'application/json'
      }
    }
  };

  constructor(bearerToken) {
    this.#bearerToken = bearerToken;
    this.#client = p.defaults(this.#defaultOptions);
  }

  async request(options) {
    const { path, ...otherOptions } = options;
    const { body } = await this.#client({
      url: new URL(path, 'https://api.cloudflare.com').toString(),
      ...otherOptions,
    });

    if (body.success) {
      return body.result;
    }

    const errorString = body.errors.reduce((accum, error) => accum + `${error.code}:${error.message}\n`, '');

    throw new Error(errorString);
  }
}
