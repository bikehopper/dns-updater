export const originName:string|undefined = process.env.ORIGIN_NAME;
export const bearerToken:string|undefined = process.env.CLOUDFLARE_BEARER_TOKEN;
export const cloudFlareZoneId:string|undefined = process.env.CLOUDFLARE_ZONE_ID;
export const dryRun:boolean = (process.env.DRY_RUN === 'true');
export const domains:string|undefined = process.env.DOMAINS;
