import CloudflareClient from './cloudflareClient.js';
import {CloudflareResult, Pool} from './cloudflare-load-balancer-pool.types.js';

interface CloudFlareLoadBalancerPoolInterface {
  client: CloudflareClient;
  getZoneDNSARecords: Function;
  updatePoolOrigin: Function;
  poolDetails: Function;
  listPools: Function;
  patchDnsRecord: Function;
}

type CloudflareAPIError = {
  code: number,
  message: string
}

export default class CloudFlareLoadBalancerPool implements CloudFlareLoadBalancerPoolInterface {
  public client: CloudflareClient;

  constructor(bearerToken:string|undefined) {
    if (!bearerToken) {
      throw new Error("CloudFlareLoadBalancerPool requires: bearerToken");
    }
    this.client = new CloudflareClient(bearerToken);
  }

  async getZoneDNSARecords(zoneId:string):Promise<CloudflareResult> {
    return this.client.request({
      method: 'GET',
      url: `/client/v4/zones/${zoneId}/dns_records?type=A`
    });
  }

  async updatePoolOrigin (pool:Pool, originName:string, originAddress:string):Promise<CloudflareResult[]> {
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

  async poolDetails(poolId:string): Promise<CloudflareResult> {
    if (!poolId) {
      throw new Error("poolDetails requires an poolId");
    }

    return this.client.request({
      method: 'GET',
      url: `/client/v4/user/load_balancers/pools/${poolId}`,
    });
  }

  async listPools(): Promise<CloudflareResult> {
    return this.client.request({
      method: 'GET',
      url: `/client/v4/user/load_balancers/pools`,
    });
  }

  async patchDnsRecord(zoneId:string, recordId:string, originAddress:string): Promise<CloudflareResult> {
    return this.client.request({
      method: 'PATCH',
      url: `/client/v4/zones/${zoneId}/dns_records/${recordId}`,
      data: {content: originAddress}
    });
  }
}
