import 'dotenv/config';
import { getPublicIPAddress } from './utils.js';
import { CloudFlareLoadBalancerPool } from './cloudFlarelLoadBalancerPool.js';

const originName = process.env.ORIGIN_NAME;
const bearerToken = process.env.CLOUDFLARE_BEARER_TOKEN;
const dryRun = (process.env.DRY_RUN === 'true');

if (!originName) {
  throw new Error('Env var ORIGIN_NAME not set.');
}

if (!bearerToken) {
  throw new Error('Env var CLOUDFLARE_BEARER_TOKEN not set.');
}

if (dryRun) {
  console.debug("Dry run mode.");
}

const cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool(bearerToken);

const publicIPAddress = await getPublicIPAddress();

const pools = await cloudFlareLoadBalancerPool.listPools();

// remove pools that
const outdatedPools = pools.filter(pool => pool.origins.some(origin => origin.address !== publicIPAddress));

// exit is nothing needs to happen
if (outdatedPools.length === 0) {
  console.debug(`No change to IP address.`);
  return;
}

const updatedOriginPools = await Promise.allSettled(outdatedPools.map(pool => {
  if (dryRun) {
    console.log(`would update: pool: ${pool.id}, ${originName}, ${publicIPAddress}`);
  } else {
    return updatePoolOrigin(pool, originName, publicIPAddress);
  }
}));

const failedUpdates = updatedOriginPools.filter(result => result.status === 'rejected');

if (failedUpdates.length > 0) {
  failedUpdates.each(failure => {
    console.error(`Failed to update CloudFlare origin pool: ${failure.reason}`);
  });
  throw new Error('Failed to update CloudFlare origin pool.');
}

console.log("Success updating CloudFlare pool origin IP addresses.");
