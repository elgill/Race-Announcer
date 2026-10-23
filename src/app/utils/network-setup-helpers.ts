import { NetworkAdapter } from "../interfaces/network-adapter";

export const DEFAULT_SUBNET_PREFIX = '192.168.1';
export const TIMING_PREFIX_LENGTH = 24;
export const TIMING_SUBNET_MASK = '255.255.255.0';

// Host numbers to try for the laptop, high in the range to stay clear of timing boxes.
const PREFERRED_HOSTS = [200, 199, 198, 197, 196, 195, 250, 240, 230, 220, 210];

export function isValidIpv4(ip: string | null | undefined): boolean {
  const parts = (ip ?? '').trim().split('.');
  return parts.length === 4 && parts.every(p => /^\d{1,3}$/.test(p) && Number(p) <= 255);
}

// First three octets, e.g. "192.168.1" for "192.168.1.10".
export function subnetPrefixOf(ip: string): string {
  return ip.trim().split('.').slice(0, 3).join('.');
}

export function isLinkLocal(ip: string): boolean {
  return ip.startsWith('169.254.');
}

export function getMatSubnetPrefix(matIps: string[]): string {
  const firstValid = matIps.find(isValidIpv4);
  return firstValid ? subnetPrefixOf(firstValid) : DEFAULT_SUBNET_PREFIX;
}

export function suggestStaticIp(matIps: string[]): string {
  const prefix = getMatSubnetPrefix(matIps);
  const taken = new Set(matIps.map(ip => ip.trim()));
  const host = PREFERRED_HOSTS.find(h => !taken.has(`${prefix}.${h}`)) ?? PREFERRED_HOSTS[0];
  return `${prefix}.${host}`;
}

export function hasAddressInSubnet(adapter: NetworkAdapter, subnetPrefix: string): boolean {
  return adapter.addresses.some(a => subnetPrefixOf(a.ip) === subnetPrefix);
}

// Picks the wired adapter most likely plugged into the timing box, or null if there are none.
export function pickRecommendedAdapter(adapters: NetworkAdapter[], subnetPrefix: string): NetworkAdapter | null {
  const score = (adapter: NetworkAdapter): number => {
    let total = 0;
    if (adapter.ipv4Mode === 'manual' && hasAddressInSubnet(adapter, subnetPrefix)) {
      total += 4;
    }
    if (adapter.status === 'Up') {
      total += 2;
    }
    // A cabled adapter with only a 169.254 address is talking to something without DHCP, like a timing box.
    if (adapter.status === 'Up' && adapter.addresses.length > 0 && adapter.addresses.every(a => isLinkLocal(a.ip))) {
      total += 1;
    }
    return total;
  };

  return adapters
    .filter(a => a.kind === 'wired')
    .reduce<NetworkAdapter | null>((best, a) => (!best || score(a) > score(best) ? a : best), null);
}

// Other connected adapters on the timing subnet (e.g. venue Wi-Fi on 192.168.1.x) can steal traffic.
export function findSubnetConflicts(adapters: NetworkAdapter[], selectedIfIndex: number, subnetPrefix: string): NetworkAdapter[] {
  return adapters.filter(a =>
    a.ifIndex !== selectedIfIndex &&
    a.status === 'Up' &&
    hasAddressInSubnet(a, subnetPrefix)
  );
}

export function describeAdapterStatus(adapter: NetworkAdapter): string {
  switch (adapter.status) {
    case 'Up':
      return 'Connected';
    case 'Disconnected':
      return adapter.kind === 'wired' ? 'Cable unplugged' : 'Disconnected';
    default:
      return adapter.status;
  }
}

export function describeIpv4Mode(adapter: NetworkAdapter): string {
  switch (adapter.ipv4Mode) {
    case 'automatic':
      return 'Automatic (DHCP)';
    case 'manual':
      return 'Manual';
    default:
      return 'Unavailable';
  }
}

export function formatAddresses(adapter: NetworkAdapter): string {
  // Windows keeps a leftover 169.254 address on unplugged DHCP adapters; it means nothing to the user.
  if (adapter.addresses.length === 0 || (adapter.status !== 'Up' && adapter.ipv4Mode === 'automatic')) {
    return 'No address';
  }
  return adapter.addresses
    .map(a => isLinkLocal(a.ip) ? `${a.ip} (self-assigned)` : a.ip)
    .join(', ');
}
