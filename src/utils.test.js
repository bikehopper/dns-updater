import { test, expect } from 'vitest';
import { getPublicIPAddress } from './utils.js';

test('#getPublicIPAddress', async () => {
  expect(await getPublicIPAddress()).toMatch(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)
});
