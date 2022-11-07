import 'dotenv/config';
import { getPublicIPAddress, getZoneDNSRecords, updateDNSRecord } from './utils.js';

// comma seperated list example.com,bike.staging.techlabor.org,
const domainString = process.env.DOMAINS;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

if (!domainString) {
  throw new Error('Env var DOMAINS not set.');
}

if (!zoneId) {
  throw new Error('Env var CLOUDFLARE_ZONE_ID not set.');
}

// list of domains that need to be associated
const domains = domainString.split(',').map(s => s.trim()).filter(s => s.length !== 0);

const publicIPAddress = await getPublicIPAddress();

const dnsRecords = await getZoneDNSRecords(zoneId);
const updates = domains.reduce((updatePromises, domainName) => {
  const dnsRecord = dnsRecords.find(r => r.name === domainName);

  if (dnsRecord) {
    console.log(dnsRecord.id, domainName, publicIPAddress);

    // updatePromises.push(
    //   updateDNSRecord(dnsRecord.id, {
    //     type: 'A',
    //     name: domainName,
    //     content: publicIPAddress,
    //     ttl: 3600,
    //     proxied: false
    //   })
    // );
  }

  return updatePromises;
}, []);

const allUpdates = await Promise.allSettled(updates);

allUpdates.forEach(update => {
  const logger = update.status === "fulfilled" ? console.info : console.error;
  logger(`Update to ${update.value.body.result.zone_name}: ${update.status}`);
});
