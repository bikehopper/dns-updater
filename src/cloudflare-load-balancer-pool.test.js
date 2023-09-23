import { describe, beforeEach, afterEach, test, expect, vi, afterAll } from 'vitest';
import CloudFlareLoadBalancerPool from './cloudflare-load-balancer-pool.js';
import p from 'phin';

vi.mock('phin');

describe('#getZoneDNSARecords', () => {
  let cloudFlareLoadBalancerPool;

  beforeEach(() => {
    p.defaults.mockReturnValueOnce(async function () {
      return {
        body: {
          success: true,
          result: ['result']
        }
      }
    })
    .mockReturnValueOnce(async function () {
      return {
        body: {
          success: false,
          errors: [{code: 401, message: 'unauthorized'}]
        }
      }
    });

    cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool('FAKE_BEARER_TOKEN');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('should return results array', async () => {
    const zoneId = 'zone1';
    const result = await cloudFlareLoadBalancerPool.getZoneDNSARecords(zoneId);
    expect(result).toEqual(['result']);
  });

  test('should throw an error if requst fails', async () => {
    const zoneId = 'zone1';
    await expect(cloudFlareLoadBalancerPool.getZoneDNSARecords(zoneId)).rejects.toThrow('401:unauthorized')
  });
});

describe('#updatePoolOrigin successful API call', () => {
  const mockPoll = {
    id: 1,
    name: 'pool-name',
    origins: [{
      name: 'pool-origin-name-1'
    }]
  };
  const mockOriginName = 'pool-origin-name-1';
  const mockOriginAddress = 'pool-origin-address-1';
  let cloudFlareLoadBalancerPool, clientSpy;

  beforeEach(() => {
    clientSpy = vi.fn(async () => {
      return {
        body: {
          success: true,
          result: ['result']
        }
      }
    });
    p.defaults.mockReturnValue(clientSpy);

    cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool('FAKE_BEARER_TOKEN');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('should make a request with with these params', async () => {
    const result = await cloudFlareLoadBalancerPool.updatePoolOrigin(mockPoll, mockOriginName, mockOriginAddress);
    expect(clientSpy).toHaveBeenCalledWith({
      method: 'PUT',
      url: `https://api.cloudflare.com/client/v4/user/load_balancers/pools/${mockPoll.id}`,
      data: {
        name: mockPoll.name,
        check_regions: ['WNAM'],
        latitude: 37.7749,
        longitude: 122.4194,
        monitor: '66f2ebed851135c41641b72327577a71',
        origins: [{
          address: 'pool-origin-address-1',
          name: 'pool-origin-name-1'
        }]
      }
    });
    expect(result).toEqual(['result']);
  });

  test('should throw an error if bearer token not provided', async () => {
    expect(() => { new CloudFlareLoadBalancerPool() }).toThrow('CloudFlareLoadBalancerPool requires: bearerToken');
  });

  test('should throw an error if pool isnt set', async () => {
    await expect(cloudFlareLoadBalancerPool.updatePoolOrigin()).rejects.toThrow('updatePoolOrigin requires an pool');
  });

  test('should throw an error if originPoll isnt set', async () => {
    await expect(cloudFlareLoadBalancerPool.updatePoolOrigin(mockPoll)).rejects.toThrow('updatePoolOrigin requires an originName');
  });

  test('should throw an error if pool isnt set', async () => {
    await expect(cloudFlareLoadBalancerPool.updatePoolOrigin(mockPoll, mockOriginName)).rejects.toThrow('updatePoolOrigin requires an originAddress');
  });
});

describe('#updatePoolOrigin failed API call', () => {
  const mockPoll = {
    id: 1,
    name: 'pool-name',
    origins: [{
      name: 'pool-origin-name-1'
    }]
  };
  const mockOriginName = 'pool-origin-name-1';
  const mockOriginAddress = 'pool-origin-address-1';
  let cloudFlareLoadBalancerPool, errorClient;

  beforeEach(() => {
    errorClient = async () => {
      return {
        body: {
          success: false,
          errors: [{code: 401, message: 'unauthorized'}]
        }
      }
    };
    p.defaults.mockReturnValue(errorClient);

    cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool('FAKE_BEARER_TOKEN');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('should throw an error if request fails', async () => {
    await expect(cloudFlareLoadBalancerPool.updatePoolOrigin(mockPoll, mockOriginName, mockOriginAddress)).rejects.toThrow('401:unauthorized')
  });
});

describe('#poolDetails', () => {
  let cloudFlareLoadBalancerPool;

  beforeEach(() => {
    p.defaults.mockReturnValueOnce(async function () {
      return {
        body: {
          success: true,
          result: ['result']
        }
      }
    })
    .mockReturnValueOnce(async function () {
      return {
        body: {
          success: false,
          errors: [{code: 401, message: 'unauthorized'}]
        }
      }
    });

    cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool('FAKE_BEARER_TOKEN');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('should return results array', async () => {
    const poolId = 'pool1';
    const result = await cloudFlareLoadBalancerPool.poolDetails(poolId);
    expect(result).toEqual(['result']);
  });

  test('should throw an error if requst fails', async () => {
    const poolId = 'pool1';
    await expect(cloudFlareLoadBalancerPool.poolDetails(poolId)).rejects.toThrow('401:unauthorized')
  });

  test('should throw an error if poolId isnt set', async () => {
    await expect(cloudFlareLoadBalancerPool.poolDetails()).rejects.toThrow('poolDetails requires an poolId');
  });
});

describe('#listPools', () => {
  let cloudFlareLoadBalancerPool;

  beforeEach(() => {
    p.defaults.mockReturnValueOnce(async function () {
      return {
        body: {
          success: true,
          result: ['result']
        }
      }
    })
    .mockReturnValueOnce(async function () {
      return {
        body: {
          success: false,
          errors: [{code: 401, message: 'unauthorized'}]
        }
      }
    });

    cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool('FAKE_BEARER_TOKEN');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('should return results array', async () => {
    const result = await cloudFlareLoadBalancerPool.listPools();
    expect(result).toEqual(['result']);
  });

  test('should throw an error if requst fails', async () => {
    await expect(cloudFlareLoadBalancerPool.listPools()).rejects.toThrow('401:unauthorized')
  });
});

describe('#patchDnsRecord success', () => {
  const zoneId = 'zone1';
  const recordId = 'record1'
  const data = {testKey: 'testValue'};
  let cloudFlareLoadBalancerPool;

  beforeEach(() => {
    p.defaults.mockReturnValue(async function () {
      return {
        body: {
          success: true,
          result: ['result']
        }
      }
    });

    cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool('FAKE_BEARER_TOKEN');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('should return results array', async () => {
    const result = await cloudFlareLoadBalancerPool.patchDnsRecord(zoneId, recordId, data);
    expect(result).toEqual(['result']);
  });
});

describe('#patchDnsRecord faiure', () => {
  const zoneId = 'zone1';
  const recordId = 'record1'
  const data = {testKey: 'testValue'};
  let cloudFlareLoadBalancerPool;

  beforeEach(() => {
    p.defaults.mockReturnValueOnce(async function () {
      return {
        body: {
          success: false,
          errors: [{code: 401, message: 'unauthorized'}]
        }
      }
    });

    cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool('FAKE_BEARER_TOKEN');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('should throw an error if requst fails', async () => {
    await expect(cloudFlareLoadBalancerPool.patchDnsRecord(zoneId, recordId, data)).rejects.toThrow('401:unauthorized')
  });
});
