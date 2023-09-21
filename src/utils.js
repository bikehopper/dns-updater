import p from 'phin';
import arrayShuffle from 'array-shuffle';
import { open } from 'node:fs/promises';

// GET req to these domains just returns your IP
const getIpRetrievingSites = () => {
  return arrayShuffle([
    'https://icanhazip.com',
    'https://ifconfig.me',
    'https://api.ipify.org',
    'https://ipinfo.io/ip',
    'https://ipecho.net/plain',
    'https://domains.google.com/checkip',
  ]);
};

export async function getPublicIPAddress() {
  const ipRetrievingSites = getIpRetrievingSites();
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

export async function convertLabelStringsToObj(labelsPath) {
  const file = await open(labelsPath);
  const labels = {};

  for await (const line of file.readLines()) {
    const [key, value] = line.split('=');
    labels[key] = value;
  }

  return labels;
}
