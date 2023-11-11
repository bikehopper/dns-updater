export const originName = process.env.ORIGIN_NAME;
export const bearerToken = process.env.CLOUDFLARE_BEARER_TOKEN;
export const cloudFlareZoneId = process.env.CLOUDFLARE_ZONE_ID;
export const dryRun = (process.env.DRY_RUN === 'true');
export const domains = process.env.DOMAINS.split(',').filter(s => s.length);
export const log_level = process.env.LOG_LEVEL;
