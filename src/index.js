import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async';
import { updateLoadBalancerOrigins, updateDnsRecords } from './cloudflare.js';
import {
  domains,
  originName,
} from './config.js';
import { getPublicIPAddress } from './utils.js'

const shouldUpdateOrigins = originName && originName.length > 0;
const shouldUpdateDns = domains && domains.length > 0;

// The signals we want to handle
// NOTE: although it is tempting, the SIGKILL signal (9) cannot be intercepted and handled
const signals = {
  'SIGHUP': 1,
  'SIGINT': 2,
  'SIGTERM': 15
};

const cache = {
  lastIPAddressOrigin: null,
  lastIPAddressDns: null,
  lastIPAddress: null,
};

const interval = setIntervalAsync(async () => {
  const publicIPAddress = await getPublicIPAddress();

  if(cache.lastIPAddress === publicIPAddress) {
    console.log('No change to IP address.');
    return;
  }
  const pendingUpdates = []

  if (shouldUpdateOrigins) {
    pendingUpdates.push(updateLoadBalancerOrigins(publicIPAddress));
  }

  if (shouldUpdateDns) {
    pendingUpdates.push(updateDnsRecords(publicIPAddress));
  }

  await Promise.all(pendingUpdates);

  cache.lastIPAddress = publicIPAddress;
}, 60000);

const shutdown = async (signal, value) => {
  console.log("shutdown!");
  await clearIntervalAsync(interval);
  process.exit(128 + value);
};

// Create a listener for each of the signals that we want to handle
Object.keys(signals).forEach((signal) => {
  process.on(signal, async () => {
    console.log(`process received a ${signal} signal`);
    await shutdown(signal, signals[signal]);
  });
});
