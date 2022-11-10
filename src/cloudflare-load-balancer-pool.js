import p from 'phin';

export default class CloudFlareLoadBalancerPool {
  constructor(bearerToken) {
    if (!bearerToken) {
      throw new Error("CloudFlareLoadBalancerPool requires: bearerToken");
    }
    this.client = p.defaults({
      parse: 'json',
      core: {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    })
  }

  async getZoneDNSRecords(zoneId) {
    const { body } = await this.client({
      method: 'GET',
      url: `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`
    });

    if (body.success) {
      return body.result;
    }
    throw new Error(`${body.errors[0].code}:${body.errors[0].message}`);
  }

  async updatePoolOrigin (pool, originName, originAddress) {
    if (!pool) {
      throw new Error("updatePoolOrigin requires an pool");
    }

    if (!originName) {
      throw new Error("updatePoolOrigin requires an originName");
    }

    if (!originAddress) {
      throw new Error("updatePoolOrigin requires an originAddress");
    }

    const { body } = await this.client({
      method: 'PUT',
      url: `https://api.cloudflare.com/client/v4/user/load_balancers/pools/${pool.id}`,
      data: {
        origins: pool.origins.map(org => {
          if (org.name === originName) {
            org.address = originAddress
          }
          return org;
        })
      }
    });

    if (body.success) {
      return body.result;
    }
    throw new Error(`${body.errors[0].code}:${body.errors[0].message}`);
  }

  async poolDetails(poolId) {
    if (!poolId) {
      throw new Error("getPool requires an poolId");
    }

    const { body } = await this.client({
      method: 'GET',
      url: `https://api.cloudflare.com/client/v4/user/load_balancers/pools/${poolId}`,
    });

    if (body.success) {
      return body.result;
    }
    throw new Error(`${body.errors[0].code}:${body.errors[0].message}`);
  }

  async listPools () {
    const { body } = await this.client({
      method: 'GET',
      url: `https://api.cloudflare.com/client/v4/user/load_balancers/pools`,
    });

    if (body.success) {
      return body.result;
    }
    throw new Error(`${body.errors[0].code}:${body.errors[0].message}`);
  }
}
