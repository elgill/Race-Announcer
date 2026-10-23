import { NetworkAdapter } from '../interfaces/network-adapter';
import {
  findSubnetConflicts,
  getMatSubnetPrefix,
  isValidIpv4,
  pickRecommendedAdapter,
  suggestStaticIp
} from './network-setup-helpers';

function adapter(overrides: Partial<NetworkAdapter>): NetworkAdapter {
  return {
    ifIndex: 1,
    name: 'Ethernet',
    description: 'Realtek USB GbE Family Controller',
    status: 'Up',
    kind: 'wired',
    ipv4Mode: 'automatic',
    addresses: [],
    ...overrides
  };
}

describe('network-setup-helpers', () => {
  describe('isValidIpv4', () => {
    it('accepts complete addresses and rejects partial ones', () => {
      expect(isValidIpv4('192.168.1.200')).toBeTrue();
      expect(isValidIpv4('192.168.1.')).toBeFalse();
      expect(isValidIpv4('192.168.1.256')).toBeFalse();
      expect(isValidIpv4('')).toBeFalse();
    });
  });

  describe('getMatSubnetPrefix / suggestStaticIp', () => {
    it('defaults to 192.168.1 when no mats are configured', () => {
      expect(getMatSubnetPrefix([])).toBe('192.168.1');
      expect(suggestStaticIp([])).toBe('192.168.1.200');
    });

    it('follows the mat subnet and skips addresses the mats use', () => {
      expect(suggestStaticIp(['10.0.0.200', '10.0.0.5'])).toBe('10.0.0.199');
    });

    it('ignores incomplete mat addresses', () => {
      expect(getMatSubnetPrefix(['192.168.', '10.1.2.3'])).toBe('10.1.2');
    });
  });

  describe('pickRecommendedAdapter', () => {
    const wifi = adapter({ ifIndex: 19, name: 'Wi-Fi', kind: 'wireless', addresses: [{ ip: '192.168.1.237', prefixLength: 24 }] });
    const vpn = adapter({ ifIndex: 25, name: 'Tailscale', kind: 'virtual', ipv4Mode: 'manual', addresses: [{ ip: '169.254.83.107', prefixLength: 16 }] });

    it('never recommends Wi-Fi or VPN adapters', () => {
      expect(pickRecommendedAdapter([wifi, vpn], '192.168.1')).toBeNull();
    });

    it('prefers a connected wired adapter over an unplugged one', () => {
      const unplugged = adapter({ ifIndex: 5, status: 'Disconnected' });
      const plugged = adapter({ ifIndex: 7, name: 'Ethernet 2', addresses: [{ ip: '169.254.10.1', prefixLength: 16 }] });
      expect(pickRecommendedAdapter([wifi, unplugged, plugged, vpn], '192.168.1')?.ifIndex).toBe(7);
    });

    it('prefers an adapter already configured for the timing subnet', () => {
      const dock = adapter({ ifIndex: 5, name: 'Dock Ethernet', addresses: [{ ip: '10.20.0.15', prefixLength: 24 }] });
      const configured = adapter({ ifIndex: 7, status: 'Disconnected', ipv4Mode: 'manual', addresses: [{ ip: '192.168.1.200', prefixLength: 24 }] });
      expect(pickRecommendedAdapter([dock, configured], '192.168.1')?.ifIndex).toBe(7);
    });
  });

  describe('findSubnetConflicts', () => {
    it('flags other connected adapters on the timing subnet', () => {
      const ethernet = adapter({ ifIndex: 5 });
      const wifi = adapter({ ifIndex: 19, name: 'Wi-Fi', kind: 'wireless', addresses: [{ ip: '192.168.1.237', prefixLength: 24 }] });
      const offlineWifi = adapter({ ifIndex: 20, status: 'Disconnected', addresses: [{ ip: '192.168.1.50', prefixLength: 24 }] });
      expect(findSubnetConflicts([ethernet, wifi, offlineWifi], 5, '192.168.1').map(a => a.ifIndex)).toEqual([19]);
    });
  });
});
