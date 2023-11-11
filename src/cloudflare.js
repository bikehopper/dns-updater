import CloudFlareLoadBalancerPool from './cloudflare-load-balancer-pool.js';
import {
  bearerToken,
  cloudFlareZoneId,
  domains,
  dryRun,
  originName,
} from './config.js';
import { debug, info, warn, error } from './logger.js';

const cloudFlareLoadBalancerPool = new CloudFlareLoadBalancerPool(bearerToken);

export async function updateLoadBalancerOrigins(publicIPAddress) {
  if (!originName || originName.length === 0) {
    throw new Error('Env var ORIGIN_NAME not set.');
  }

  if (!bearerToken || bearerToken.length === 0) {
    throw new Error('Env var CLOUDFLARE_BEARER_TOKEN not set.');
  }

  if (dryRun === true) {
    debug('<-------- Dry run mode -------->');
  }

  const pools = await cloudFlareLoadBalancerPool.listPools();

  // remove pools that have an current IP
  const outdatedPools = pools
    .filter(pool => pool.origins.some(origin => origin.address !== publicIPAddress))
    .filter(pool => pool.origins.some(origin => origin.name === originName));

  const updatedOriginPools = await Promise.allSettled(outdatedPools.map(pool => {
    if (dryRun) {
      info(`would update, pool: ${pool.id}, ${originName}, ${publicIPAddress}`);
    } else {
      warn(`patching poolId: ${pool.id}:${originName} to ${publicIPAddress}`);
      return cloudFlareLoadBalancerPool.updatePoolOrigin(pool, originName, publicIPAddress);
    }
  }));

  const failedUpdates = updatedOriginPools.filter(result => result.status === 'rejected');

  if (failedUpdates.length > 0) {
    failedUpdates.forEach(failure => {
      error(`Failed to update CloudFlare origin pool: ${failure.reason}`);
    });
    return;
  }

  info(`Successful run of CloudFlare pool origin IP address updater for ${updatedOriginPools.length} pool(s).`);
}

export async function updateDnsRecords(publicIPAddress) {
  if (!cloudFlareZoneId) {
    throw new Error('Env var CLOUDFLARE_ZONE_ID not set.');
  }

  if (domains.length === 0) {
    error(Error('Env var DOMAINS not set.'));
  }

  if (dryRun === true) {
    debug('<-------- Dry run mode -------->');
  }

  const zoneDnsRecords = await cloudFlareLoadBalancerPool.getZoneDNSARecords(cloudFlareZoneId);
  const relevantDNSZoneRecrods = zoneDnsRecords.filter(record => domains.includes(record.name));

  await Promise.all(relevantDNSZoneRecrods
    .map(record => {
      if (dryRun) {
        info(`would patch id: ${record.id}, name: ${record.name}, ipaddreess: ${publicIPAddress}`);
      } else {
        warn(`patching id: ${record.id}, name: ${record.name}, ipaddreess: ${publicIPAddress}`);
        return cloudFlareLoadBalancerPool.patchDnsRecord(cloudFlareZoneId, record.id, {
          content: publicIPAddress
        });
      }
    })
  );

  info(`Successful run of CloudFlare DNS A record updater for ${relevantDNSZoneRecrods.length} DNS record(s).`);
}
