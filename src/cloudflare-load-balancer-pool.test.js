import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import p from 'phin';
import CloudFlareLoadBalancerPool from './cloudflare-load-balancer-pool.js';

jest.mock('phin', () => {
  return jest.fn().mockImplementation(() => {
    return {
      defaults: jest.fn().mockImplementation(() => {
        return function () {
          return Promise.resolve({
            body: {
              success: true,
              result: ['result']
            }
          })
        }
      })
    }
  });
});

describe('#getZoneDNSARecords', () => {
  let cloudFlareLoadBalancerPool;

  beforeEach(() => {
    cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool('FAKE_BEARER_TOKEN');
  });

  test('should return results array', async () => {
    const zoneId = 'zone1';
    const result = await cloudFlareLoadBalancerPool.getZoneDNSARecords(zoneId);
    expect(result).toEqual(['result']);
  })
});
