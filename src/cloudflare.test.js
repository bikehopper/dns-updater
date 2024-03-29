import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { updateLoadBalancerOrigins } from './cloudflare.js';
import * as exports from './config.js';
import CloudFlareLoadBalancerPool from './cloudflare-load-balancer-pool.js';
import loglevel from 'loglevel';

vi.mock('loglevel');
vi.mock('./config.js');
vi.mock('./utils.js');
vi.mock('./cloudflare-load-balancer-pool.js');

describe('updateLoadBalancerOrigins env vars', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ORIGIN_NAME is empty string', () => {
    beforeEach(() => {
      vi.spyOn(exports, 'originName', 'get').mockReturnValue('')
    });

    test('should fail', async () => {
      await expect(updateLoadBalancerOrigins({})).rejects.toThrow('Env var ORIGIN_NAME not set.');
    });
  });

  describe('ORIGIN_NAME is null', () => {
    beforeEach(() => {
      vi.spyOn(exports, 'originName', 'get').mockReturnValue(null);
    });

    test('should fail', async () => {
      await expect(updateLoadBalancerOrigins({})).rejects.toThrow('Env var ORIGIN_NAME not set.');
    });
  });

  describe('ORIGIN_NAME is undefined', () => {
    beforeEach(() => {
      vi.spyOn(exports, 'originName', 'get').mockReturnValue(undefined);
    });

    test('should fail', async () => {
      await expect(updateLoadBalancerOrigins({})).rejects.toThrow('Env var ORIGIN_NAME not set.');
    });
  });

  describe('CLOUDFLARE_BEARER_TOKEN is empty string', () => {
    beforeEach(async () => {
      vi.spyOn(exports, 'bearerToken', 'get').mockReturnValue('');
    });

    test('should fail', async () => {
      await expect(updateLoadBalancerOrigins({})).rejects.toThrow('Env var CLOUDFLARE_BEARER_TOKEN not set.');
    });
  });

  describe('CLOUDFLARE_BEARER_TOKEN is null', () => {
    beforeEach(async () => {
      vi.spyOn(exports, 'bearerToken', 'get').mockReturnValue(null);
    });

    test('should fail', async () => {
      await expect(updateLoadBalancerOrigins({})).rejects.toThrow('Env var CLOUDFLARE_BEARER_TOKEN not set.');
    });
  });

  describe('CLOUDFLARE_BEARER_TOKEN is undefined', () => {
    beforeEach(async () => {
      vi.spyOn(exports, 'bearerToken', 'get').mockReturnValue(undefined);
    });

    test('should fail', async () => {
      await expect(updateLoadBalancerOrigins({})).rejects.toThrow('Env var CLOUDFLARE_BEARER_TOKEN not set.');
    });
  });
});

describe('updateLoadBalancerOrigins dry run mode', () => {
  const logLevelDebugMock = vi.fn();
  beforeEach(() => {
    loglevel.debug.mockImplementation(logLevelDebugMock);
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  test('should log', async () => {
    try {
      await updateLoadBalancerOrigins({});
    } catch {}

    expect(logLevelDebugMock).toHaveBeenNthCalledWith(1, '<-------- Dry run mode -------->');
  });
});

describe('updateLoadBalancerOrigins IP changed', () => {
  describe('dry run', () => {
    const mockOriginName = 'mock-origin-name';
    const mockIP = '0.0.0.1';
    const mockListPoolsResp = [
      {
        "id": "17b5962d775c646f3f9725cbc7a53df4",
        "origins": [
          {
            "address": "0.0.0.0",
            "name": `some-other-origin-name`
          },
          {
            "address": "0.0.0.244",
            "name": mockOriginName
          }
        ]
      }
    ];
    let client;
    const logLevelInfoMock = vi.fn();
    beforeEach(() => {
      loglevel.info.mockImplementation(logLevelInfoMock);
      vi.spyOn(exports, 'originName', 'get').mockReturnValue(mockOriginName);
      vi.spyOn(exports, 'dryRun', 'get').mockReturnValue(true);
      client = new CloudFlareLoadBalancerPool('mockBearerToken');
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('should call log for each update', async () => {
      client.listPools.mockResolvedValue(mockListPoolsResp);
      await updateLoadBalancerOrigins(mockIP);

      expect(logLevelInfoMock).toHaveBeenCalledWith(`would update, pool: ${mockListPoolsResp[0].id}, ${mockOriginName}, ${mockIP}`);

    });
  });

  describe('failure wet run', () => {
    const mockUpdatePoolError = new Error('7003:No route for the URI');
    const logLevelErrorMock = vi.fn();
    const mockOriginName = 'mock-origin-name';
    const mockIP = '0.0.0.1';
    const mockListPoolsResp = [
      {
        "id": "17b5962d775c646f3f9725cbc7a53df4",
        "origins": [
          {
            "address": "0.0.0.0",
            "name": mockOriginName
          }
        ]
      }
    ];
    let client;

    beforeEach(() => {
      loglevel.error.mockImplementation(logLevelErrorMock);
      vi.spyOn(exports, 'originName', 'get').mockReturnValue(mockOriginName);
      vi.spyOn(exports, 'dryRun', 'get').mockReturnValue(false);
      client = new CloudFlareLoadBalancerPool('mockBearerToken');
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('should call log for each update', async () => {
      client.listPools.mockResolvedValue(mockListPoolsResp);
      client.updatePoolOrigin.mockRejectedValue(mockUpdatePoolError);

      await updateLoadBalancerOrigins(mockIP);

      expect(client.updatePoolOrigin).toHaveBeenCalledWith(mockListPoolsResp[0], mockOriginName, mockIP)
      expect(logLevelErrorMock).toHaveBeenCalledWith(`Failed to update CloudFlare origin pool: ${mockUpdatePoolError}`);
    });
  });

  describe('successful wet run', () => {
    const mockOriginName = 'mock-origin-name';
    const mockIP = '0.0.0.1';
    const mockListPoolsResp = [
      {
        "id": "17b5962d775c646f3f9725cbc7a53df4",
        "origins": [
          {
            "address": "0.0.0.0",
            "name": mockOriginName
          }
        ]
      }
    ];
    let client;
    const logLevelInfoMock = vi.fn();

    beforeEach(() => {
      loglevel.info.mockImplementation(logLevelInfoMock);
      vi.spyOn(exports, 'originName', 'get').mockReturnValue(mockOriginName);
      vi.spyOn(exports, 'dryRun', 'get').mockReturnValue(false);
      client = new CloudFlareLoadBalancerPool('mockBearerToken');
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('should call log for each update', async () => {
      client.listPools.mockResolvedValue(mockListPoolsResp);
      client.updatePoolOrigin.mockResolvedValue({});

      await updateLoadBalancerOrigins(mockIP);

      expect(client.updatePoolOrigin).toHaveBeenCalledWith(mockListPoolsResp[0], mockOriginName, mockIP)
      expect(logLevelInfoMock).toHaveBeenCalledWith(`Successful run of CloudFlare pool origin IP address updater for 1 pool(s).`);
    });
  });
});
