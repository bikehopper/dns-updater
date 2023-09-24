import CloudflareClient from './cloudflareClient';

export default class CloudFlareLoadBalancerPool {
  constructor(bearerToken) {
    if (!bearerToken) {
      throw new Error("CloudFlareLoadBalancerPool requires: bearerToken");
    }
    this.client = new CloudflareClient(bearerToken);
  }

  async getZoneDNSARecords(zoneId) {
    return this.client.request({
      method: 'GET',
      url: `/client/v4/zones/${zoneId}/dns_records?type=A`
    });
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

    return this.client.request({
      method: 'PUT',
      url: `/client/v4/user/load_balancers/pools/${pool.id}`,
      data: {
        name: pool.name,
        check_regions: ['WNAM'],
        latitude: 37.7749,
        longitude: 122.4194,
        monitor: '66f2ebed851135c41641b72327577a71',
        origins: pool.origins.map(org => {
          if (org.name === originName) {
            org.address = originAddress
          }
          return org;
        })
      }
    });
  }

  async poolDetails(poolId) {
    if (!poolId) {
      throw new Error("poolDetails requires an poolId");
    }

    return this.client.request({
      method: 'GET',
      url: `/client/v4/user/load_balancers/pools/${poolId}`,
    });
  }

  async listPools () {
    return this.client.request({
      method: 'GET',
      url: `/client/v4/user/load_balancers/pools`,
    });
  }

  async patchDnsRecord(zoneId, recordId, data) {
    return this.client.request({
      method: 'PATCH',
      url: `/client/v4/zones/${zoneId}/dns_records/${recordId}`,
      data
    });
  }
}
