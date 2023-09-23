import p from 'phin';

export default class CloudflareClient {
  #bearerToken;
  #client;
  #defaultOptions = {
    parse: 'json',
    hostname: 'https://api.cloudflare.com',
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
    const { body } = await this.#client(options);

    if (body.success) {
      return body.result;
    }

    const errorString = body.errors.reduce((accum, error) => accum + `${error.code}:${error.message}\n`, '');

    throw new Error(errorString);
  }
}
