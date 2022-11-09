import p from 'phin';
import arrayShuffle from 'array-shuffle';

// GET req to these domains just returns your IP
const ipRetrievingSites = arrayShuffle([
  'https://icanhazip.com',
  'https://ifconfig.me',
  'https://api.ipify.org',
  'https://ipinfo.io/ip',
  'https://ipecho.net/plain',
  'https://domains.google.com/checkip',
]);

export async function getPublicIPAddress() {
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
