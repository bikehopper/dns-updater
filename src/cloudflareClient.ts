import p from 'phin';
import { URL } from 'node:url';
import phin from 'phin';

type CloudflareAPIError = {
  code: number,
  message: string
}

export default class CloudflareClient {
  #bearerToken;
  #client;
  get #defaultOptions() {
    return {
      parse: 'json',
      core: {
        headers: {
          'Authorization': `Bearer ${this.#bearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    }
  };

  constructor(bearerToken:string) {
    this.#bearerToken = bearerToken;
    this.#client = p.defaults(this.#defaultOptions);
  }

  async request(options:phin.IOptions|phin.IWithData<phin.IOptions>): Promise<any> {
    const { path, url, ...otherOptions } = options;
    if (!path) {
      throw new Error('path option required.');
    }
    const { body } = await this.#client({
      url: new URL(path, 'https://api.cloudflare.com').toString(),
      ...otherOptions,
    });

    if (body.success) {
      return body.result;
    }

    const errorString = body.errors.reduce((accum:string, error:CloudflareAPIError) => accum + `${error.code}:${error.message}\n`, '');

    throw new Error(errorString);
  }
}
