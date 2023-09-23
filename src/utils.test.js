import { describe, beforeEach, afterEach, test, expect, vi, afterAll } from 'vitest';
import { getPublicIPAddress } from './utils.js';
import p from 'phin';

vi.mock('phin');

describe('successful getPublicIPAddress', () => {

  beforeEach(() => {
    p.mockResolvedValue({ body: '192.123.50.1' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('#getPublicIPAddress', async () => {
    expect(await getPublicIPAddress()).toMatch(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)
  });
});

describe('partial failure of getPublicIPAddress', () => {
  beforeEach(() => {
    p.mockRejectedValueOnce(new Error('500 timeout')).mockResolvedValueOnce({ body: '192.123.50.1' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('#getPublicIPAddress should return an ip', async () => {
    const result = await getPublicIPAddress();
    expect(result).toMatch(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/);
    expect(p).toBeCalledTimes(2);
  });
});

describe('failure of getPublicIPAddress', () => {
  const consoleMock = {
    log: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
  beforeEach(() => {
    p.mockRejectedValue(new Error('500 timeout'));
    vi.stubGlobal('console', consoleMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('#getPublicIPAddress', async () => {
    await expect(getPublicIPAddress()).rejects.toEqual(new Error('Failed to get public IP address.'));
    expect(consoleMock.error).toBeCalledTimes(6);
  });
});
