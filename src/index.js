import * as dotenv from 'dotenv';
import { getPublicIPAddress, convertLabelStringsToObj } from './utils.js';
import CloudFlareLoadBalancerPool from './cloudflare-load-balancer-pool.js';

dotenv.config();
console.log(process.env.LABELS_FILE_PATH)
const labels = convertLabelStringsToObj(process.env.LABELS_FILE_PATH);
console.log(labels);
const originName = labels['topology.kubernetes.io/zone'];
const bearerToken = process.env.CLOUDFLARE_BEARER_TOKEN;
const dryRun = (process.env.DRY_RUN === 'true');

if (!originName) {
  throw new Error('Env var ORIGIN_NAME not set.');
}

if (!bearerToken) {
  throw new Error('Env var CLOUDFLARE_BEARER_TOKEN not set.');
}

if (dryRun === true) {
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
  process.exit(0);
}

const updatedOriginPools = await Promise.allSettled(outdatedPools.map(pool => {
  if (dryRun) {
    console.log(`would update: pool: ${pool.id}, ${originName}, ${publicIPAddress}`);
  } else {
    // return updatePoolOrigin(pool, originName, publicIPAddress);
  }
}));

const failedUpdates = updatedOriginPools.filter(result => result.status === 'rejected');

if (failedUpdates.length > 0) {
  failedUpdates.each(failure => {
    console.error(`Failed to update CloudFlare origin pool: ${failure.reason}`);
  });
  throw new Error('Failed to update CloudFlare origin pool.');
}

console.log(`Successful run of CloudFlare pool origin IP address updater.`);
