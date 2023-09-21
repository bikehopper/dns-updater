import cron from 'node-cron';
import { updateLoadBalancerOrigins, updateDnsRecords } from './cloudflare.js';

// The signals we want to handle
// NOTE: although it is tempting, the SIGKILL signal (9) cannot be intercepted and handled
const signals = {
  'SIGHUP': 1,
  'SIGINT': 2,
  'SIGTERM': 15
};

const cache = {
  lastIPAddressOrigin: null,
  lastIPAddressDns: null,
};

const task = cron.schedule('* * * * *', () => {
  updateLoadBalancerOrigins(cache);
  updateDnsRecords(cache);
});

const shutdown = (signal, value) => {
  console.log("shutdown!");
  task.stop();
  process.exit(128 + value);
};

// Create a listener for each of the signals that we want to handle
Object.keys(signals).forEach((signal) => {
  process.on(signal, () => {
    console.log(`process received a ${signal} signal`);
    shutdown(signal, signals[signal]);
  });
});
