import { describe, beforeEach, afterEach, test, expect, vi, afterAll } from 'vitest';
import { getPublicIPAddress } from './utils.js';
import p from 'phin';
import loglevel from 'loglevel';

vi.mock('phin');
vi.mock('loglevel');

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
  const logLevelerrorMock = vi.fn();
  beforeEach(() => {
    p.mockRejectedValue(new Error('500 timeout'));
    loglevel.error.mockImplementation(logLevelerrorMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test('#getPublicIPAddress', async () => {
    await expect(getPublicIPAddress()).rejects.toEqual(new Error('Failed to get public IP address.'));
    expect(logLevelerrorMock).toBeCalledTimes(6);
  });
});
