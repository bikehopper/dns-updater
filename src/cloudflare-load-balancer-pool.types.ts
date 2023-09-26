export type CloudflareResponse = {
  errors:     any[];
  messages:   any[];
  result:     CloudflareResult;
  success:    boolean;
  resultInfo: ResultInfo;
}

export type CloudflareResult = Pool[]|PoolDetails[]|DNSRecords[]

export type Pool = {
  checkRegions:       string[];
  createdOn:          Date;
  description:        string;
  disabledAt:         Date;
  enabled:            boolean;
  id:                 string;
  latitude:           number;
  loadShedding:       LoadShedding;
  longitude:          number;
  minimumOrigins:     number;
  modifiedOn:         Date;
  monitor:            null;
  name:               string;
  notificationEmail:  string;
  notificationFilter: NotificationFilter;
  originSteering:     OriginSteering;
  origins:            OriginElement[];
}

export type LoadShedding = {
  defaultPercent: number;
  defaultPolicy:  string;
  sessionPercent: number;
  sessionPolicy:  string;
}

export type NotificationFilter = {
  origin: NotificationFilterOrigin;
  pool:   PoolHealth;
}

export type NotificationFilterOrigin = {
  disable: boolean;
}

export type PoolHealth = {
  healthy: boolean;
}

export type OriginSteering = {
  policy: string;
}

export type OriginElement = {
  address:          string;
  disabledAt:       Date;
  enabled:          boolean;
  header:           Header;
  name:             string;
  virtualNetworkID: string;
  weight:           number;
}

export type Header = {
  host: string[];
}

export type ResultInfo = {
  count:      number;
  page:       number;
  perPage:    number;
  totalCount: number;
}

export type Meta = {
  autoAdded: boolean;
  source:    string;
}

export type PoolDetails = {
  content:    string;
  name:       string;
  proxied:    boolean;
  type:       string;
  comment:    string;
  createdOn:  Date;
  id:         string;
  locked:     boolean;
  meta:       Meta;
  modifiedOn: Date;
  proxiable:  boolean;
  tags:       string[];
  ttl:        number;
  zoneID:     string;
  zoneName:   string;
}

export type DNSRecords = {
  content:    string;
  name:       string;
  proxied:    boolean;
  type:       string;
  comment:    string;
  createdOn:  Date;
  id:         string;
  locked:     boolean;
  meta:       Meta;
  modifiedOn: Date;
  proxiable:  boolean;
  tags:       string[];
  ttl:        number;
  zoneID:     string;
  zoneName:   string;
}
