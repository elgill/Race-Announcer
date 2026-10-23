export type NetworkAdapterKind = 'wired' | 'wireless' | 'virtual' | 'other';

// automatic = DHCP, manual = static address, unknown = adapter disabled or IPv4 unbound
export type Ipv4Mode = 'automatic' | 'manual' | 'unknown';

export interface NetworkAdapterAddress {
  ip: string;
  prefixLength: number;
}

export interface NetworkAdapter {
  ifIndex: number;
  name: string; // Windows connection name, e.g. "Ethernet 2"
  description: string; // Driver description, e.g. "Realtek USB GbE Family Controller"
  status: string; // Get-NetAdapter status: Up, Disconnected, Disabled
  kind: NetworkAdapterKind;
  ipv4Mode: Ipv4Mode;
  addresses: NetworkAdapterAddress[];
}

export interface NetworkAdapterList {
  supported: boolean;
  adapters: NetworkAdapter[];
}
