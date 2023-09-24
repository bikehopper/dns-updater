import { getPublicIPAddress } from './utils.js';
import CloudFlareLoadBalancerPool from './cloudflare-load-balancer-pool.js';
import {
  bearerToken,
  cloudFlareZoneId,
  domains,
  dryRun,
  originName,
} from './config.js';

const cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool(bearerToken);

export async function updateLoadBalancerOrigins(publicIPAddress) {
  if (!originName || originName.length === 0) {
    throw new Error('Env var ORIGIN_NAME not set.');
  }

  if (!bearerToken || bearerToken.length === 0) {
    throw new Error('Env var CLOUDFLARE_BEARER_TOKEN not set.');
  }

  if (dryRun === true) {
    console.debug('<-------- Dry run mode -------->');
  }

  const pools = await cloudFlareLoadBalancerPool.listPools();

  // remove pools that have an outdated IP
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
      console.error(`Failed to update CloudFlare origin pool: ${failure.reason}`);
    });
    return;
  }

  console.log(`Successful run of CloudFlare pool origin IP address updater.`);
}

export async function updateDnsRecords(publicIPAddress) {
  if (!cloudFlareZoneId) {
    throw new Error('Env var CLOUDFLARE_ZONE_ID not set.');
  }

  if (domains.length === 0) {
    console.warn(Error('Env var DOMAINS not set.'));
  }

  if (dryRun === true) {
    console.debug('<-------- Dry run mode -------->');
  }

  const zoneDnsRecords = await cloudFlareLoadBalancerPool.getZoneDNSARecords(cloudFlareZoneId);

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

  console.log(`Successful run of CloudFlare DNS A record updater.`);
}
