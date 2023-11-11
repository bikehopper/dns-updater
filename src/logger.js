import loglevel from 'loglevel';
import { log_level } from './config.js';

const defaultLogLevel = 'info';

loglevel.setLevel(log_level || defaultLogLevel);

export const {
  error,
  warn,
  info,
  debug,
} = loglevel;
