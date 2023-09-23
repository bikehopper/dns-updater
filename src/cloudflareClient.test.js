import { describe, beforeEach, afterEach, test, expect, vi, afterAll } from 'vitest';
import CloudflareClient from './cloudflareClient';
import p from 'phin';

vi.mock('phin');

describe('CloudflareClient successful request', () => {
  const mockToken = 'mock-bearer-token';
  let reqSpy, clientSpy, resp;

  beforeEach(async () => {
    reqSpy = vi.fn(async () => {
      return {
        body: {
          success: true,
          result: ['result']
        }
      }
    });
    clientSpy = vi.fn(reqSpy);
    p.defaults.mockReturnValue(clientSpy);

    resp = await (new CloudflareClient(mockToken)).request({
      method: 'GET',
      path: '/api/test/path'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('should make a GET request to the test path', () => {
    expect(reqSpy).toBeCalledWith({
      method: 'GET',
      path: '/api/test/path'
    });
  });

  test('should return the the parsed JSON body', () => {
    expect(resp).toStrictEqual(['result']);
  });
});

describe('CloudflareClient failed request', () => {
  const mockToken = 'mock-bearer-token';
  let reqSpy, clientSpy, client;

  beforeEach(async () => {
    reqSpy = vi.fn(async () => {
      return {
        body: {
          success: false,
          errors: [{code: 404, message: 'not found'}, {code: 401, message: 'not authorized'}]
        }
      }
    });
    clientSpy = vi.fn(reqSpy);
    p.defaults.mockReturnValue(clientSpy);
    client = new CloudflareClient(mockToken);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('should reject with concatinated errors', async () => {
    await expect(client.request({
      method: 'GET',
      path: '/api/test/path'
    })).rejects.toThrow('404:not found\n401:not authorized\n');
  });
});
