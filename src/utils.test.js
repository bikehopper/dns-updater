import assert from 'assert';
import { getPublicIPAddress, getZoneDNSRecords, updateDNSRecord } from './utils.js';

(async () => {
  await assert.doesNotReject(getPublicIPAddress);

  const ip = await getPublicIPAddress();
  assert.match(ip, /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/);

  await assert.doesNotReject(async () => getZoneDNSRecords());
})();
