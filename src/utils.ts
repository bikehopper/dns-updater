import p from 'phin';
import arrayShuffle from 'array-shuffle';

// GET req to these domains just returns your IP
function getIpRetrievingSites(): string[] {
  return arrayShuffle([
    'https://icanhazip.com',
    'https://ifconfig.me',
    'https://api.ipify.org',
    'https://ipinfo.io/ip',
    'https://ipecho.net/plain',
    'https://domains.google.com/checkip',
  ]);
};

export async function getPublicIPAddress(): Promise<string|undefined> {
  const ipRetrievingSites = getIpRetrievingSites();
  const errors: Error[] = [];
  let ip:string|undefined;

  for (let i = 0; i < ipRetrievingSites.length; i++) {
    try {
      const { body: ipAddress } = await p(ipRetrievingSites[i]);
      ip = ipAddress.toString().trim();
      break;
    }
    catch(e) {
      if (e instanceof Error) {
        errors.push(e);
      }
    }
  }

  if (ip) {
    return ip;
  }

  if (errors.length) {
    errors.forEach(e => {
      console.error(e);
    });
    throw new Error('Failed to get public IP address.');
  }
}
