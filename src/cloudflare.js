import { getPublicIPAddress } from './utils.js';
import CloudFlareLoadBalancerPool from './cloudflare-load-balancer-pool.js';

const originName = process.env.ORIGIN_NAME;
const bearerToken = process.env.CLOUDFLARE_BEARER_TOKEN;
const dryRun = (process.env.DRY_RUN === 'true');
const cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool(bearerToken);
const cloudFlareZoneId = process.env.CLOUDFLARE_ZONE_ID;
const domains = process.env.DOMAINS.split(',').filter(s => s.length);

export async function updateLoadBalancerOrigins(cache) {
  if (!originName) {
    throw new Error('Env var ORIGIN_NAME not set.');
  }

  if (!bearerToken) {
    throw new Error('Env var CLOUDFLARE_BEARER_TOKEN not set.');
  }

  if (dryRun === true) {
    console.debug('<-------- Dry run mode -------->');
  }

  const publicIPAddress = await getPublicIPAddress();

  // exit is nothing needs to happen
  if (cache.lastIPAddressOrigin === publicIPAddress) {
    console.log('No change to IP address.');
    return;
  }

  const pools = await cloudFlareLoadBalancerPool.listPools();

  // remove pools that
  const outdatedPools = pools.filter(pool => pool.origins.some(origin => origin.address !== publicIPAddress));

  const updatedOriginPools = await Promise.allSettled(outdatedPools.map(pool => {
    if (dryRun) {
      console.log(`would update: pool: ${pool.id}, ${originName}, ${publicIPAddress}`);
    } else {
      return cloudFlareLoadBalancerPool.updatePoolOrigin(pool, originName, publicIPAddress);
    }
  }));

  const failedUpdates = updatedOriginPools.filter(result => result.status === 'rejected');

  if (failedUpdates.length > 0) {
    failedUpdates.forEach(failure => {
      console.log(`Failed to update CloudFlare origin pool: ${failure.reason}`);
    });
  }

  // update IP cache so we dont try to update thigns again.
  cache.lastIPAddressOrigin = publicIPAddress;

  console.log(`Successful run of CloudFlare pool origin IP address updater.`);
}

export async function updateDnsRecords(cache) {
  const zoneDnsRecords = await cloudFlareLoadBalancerPool.getZoneDNSARecords(cloudFlareZoneId);
  const publicIPAddress = await getPublicIPAddress();

  if (!cloudFlareZoneId) {
    throw new Error('Env var CLOUDFLARE_ZONE_ID not set.');
  }

  if (domains.length === 0) {
    console.warn(Error('Env var DOMAINS not set.'));
  }

  if (dryRun === true) {
    console.debug('<-------- Dry run mode -------->');
  }

  // exit is nothing needs to happen
  if (cache.lastIPAddressDns === publicIPAddress) {
    console.log('No change to IP address.');
    return;
  }

  await Promise.all(zoneDnsRecords
    .filter(record => domains.includes(record.name))
    .map(record => {
      if (dryRun) {
        console.log(`would patch id: ${record.id}, name: ${record.name}, ipaddreess: ${publicIPAddress}`);
      } else {
        console.log(`patching id: ${record.id}, name: ${record.name}, ipaddreess: ${publicIPAddress}`);
        return cloudFlareLoadBalancerPool.patchDnsRecord(cloudFlareZoneId, record.id, {
          content: publicIPAddress
        });
      }
    })
  );

  // update IP cache so we dont try to update thigns again.
  cache.lastIPAddressDns = publicIPAddress;

  console.log(`Successful run of CloudFlare DNS A record updater.`);
}
