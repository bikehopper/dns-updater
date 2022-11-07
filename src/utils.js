import p from 'phin';
import arrayShuffle from 'array-shuffle';
import fs from 'fs/promises';

const cfAuthEmail = process.env.CLOUDFLARE_AUTH_EMAIL;
const cfAuthKey = process.env.CLOUDFLARE_AUTH_KEY;

// GET req to these domains just returns your IP
const ipRetrievingSites = arrayShuffle([
  'https://icanhazip.com',
  'https://ifconfig.me',
  'https://api.ipify.org',
  'https://ipinfo.io/ip',
  'https://ipecho.net/plain',
  'https://domains.google.com/checkip',
]);

async function getPublicIPAddress() {
  const errors = [];
  for (let i = 0; i < ipRetrievingSites.length; i++) {
    try {
      const { body: ip } = await p(ipRetrievingSites[i]);
      return ip.toString().trim();
    }
    catch(e) {
      errors.push(e);
    }
  }

  if (errors.length) {
    errors.forEach(e => {
      console.error(e);
    });
    throw new Error('Failed to get public IP address.');
  }
}

async function getZoneDNSRecords(zoneId) {
  if (!cfAuthEmail) {
    throw new Error('Env var CLOUDFLARE_AUTH_EMAIL not set.');
  }

  if (!cfAuthKey) {
    throw new Error('Env var CLOUDFLARE_AUTH_KEY not set.');
  }

  const { body } = await p({
    method: 'GET',
    url: `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    parse: 'json',
    core: {
      headers: {
        'Authorization': `Bearer ${cfAuthKey}`,
        'Content-Type': 'application/json'
      }
    }
  });

  if (body.success) {
    return body.result;
  }
  throw new Error(`${body.errors[0].code}:${body.errors[0].message}`);
}

async function updateDNSRecord(dnsRecordId, data) {
  if (!cfAuthEmail) {
    throw new Error('Env var CLOUDFLARE_AUTH_EMAIL not set.');
  }

  if (!cfAuthKey) {
    throw new Error('Env var CLOUDFLARE_AUTH_KEY not set.');
  }

  return p({
    url: `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${dnsRecordId}`,
    method: 'PUT',
    parse: 'json',
    core: {
      headers: {
        "X-Auth-Email": cfAuthEmail,
        "X-Auth-Key": cfAuthKey,
        "Content-Type": "application/json"
      }
    },
    data
  });
}

async function getPreviousPublicIPAddress() {
  fs.readFile('/')
}

export {
  getPublicIPAddress,
  getZoneDNSRecords,
  updateDNSRecord,
};
