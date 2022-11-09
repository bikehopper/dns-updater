import assert from 'assert';
import { getPublicIPAddress } from './utils.js';

(async () => {
  await assert.doesNotReject(getPublicIPAddress);

  const ip = await getPublicIPAddress();
  assert.match(ip, /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/);
})();
