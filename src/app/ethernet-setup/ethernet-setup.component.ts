import { ChangeDetectorRef, Component, DestroyRef, Input, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormArray, FormsModule } from '@angular/forms';
import { ElectronService } from '../services/electron.service';
import { NetworkAdapter, NetworkAdapterList } from '../interfaces/network-adapter';
import {
  TIMING_PREFIX_LENGTH,
  TIMING_SUBNET_MASK,
  describeAdapterStatus,
  describeIpv4Mode,
  findSubnetConflicts,
  formatAddresses,
  getMatSubnetPrefix,
  isValidIpv4,
  pickRecommendedAdapter,
  subnetPrefixOf,
  suggestStaticIp
} from '../utils/network-setup-helpers';

@Component({
  selector: 'app-ethernet-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ethernet-setup.component.html',
  styleUrls: ['./ethernet-setup.component.css']
})
export class EthernetSetupComponent implements OnInit {
  @Input({ required: true }) matConnections!: FormArray;

  private electronService = inject(ElectronService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  readonly subnetMask = TIMING_SUBNET_MASK;
  readonly describeAdapterStatus = describeAdapterStatus;
  readonly describeIpv4Mode = describeIpv4Mode;
  readonly formatAddresses = formatAddresses;

  // Signals for state set after awaiting the main process
  supported = signal(false);
  loading = signal(false);
  adapters = signal<NetworkAdapter[]>([]);
  recommended = signal<NetworkAdapter | null>(null);
  loadError = signal('');

  dialogOpen = false;
  showAllAdapters = false;
  selectedIfIndex = signal<number | null>(null);
  staticIp = '';
  applying = signal(false);
  applyMessage = signal('');
  applyError = signal('');

  ngOnInit(): void {
    // Mat IPs come from the parent's FormArray; re-render when they change
    this.matConnections.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.changeDetectorRef.markForCheck());

    if (this.electronService.isElectron) {
      this.refresh();
    }
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');
    try {
      const result = await this.electronService.invoke<NetworkAdapterList>('network-adapters-list');
      this.supported.set(result.supported);
      this.adapters.set(result.adapters);
      this.recommended.set(pickRecommendedAdapter(this.adapters(), this.subnetPrefix));
      if (this.selectedIfIndex() === null || !this.selectedAdapter) {
        this.selectedIfIndex.set(this.recommended()?.ifIndex ?? null);
      }
    } catch (err: any) {
      this.loadError.set(`Could not read network adapters: ${err?.message ?? err}`);
    } finally {
      this.loading.set(false);
    }
  }

  openDialog(): void {
    this.applyMessage.set('');
    this.applyError.set('');
    this.selectedIfIndex.set(this.recommended()?.ifIndex ?? this.selectedIfIndex());
    this.showAllAdapters = !this.recommended();
    this.staticIp = this.defaultStaticIpFor(this.selectedAdapter);
    this.dialogOpen = true;
    this.refresh();
  }

  closeDialog(): void {
    if (!this.applying()) {
      this.dialogOpen = false;
    }
  }

  selectAdapter(adapter: NetworkAdapter): void {
    this.selectedIfIndex.set(adapter.ifIndex);
    this.staticIp = this.defaultStaticIpFor(adapter);
    this.applyMessage.set('');
    this.applyError.set('');
  }

  async setManual(): Promise<void> {
    const adapter = this.selectedAdapter;
    if (!adapter || this.staticIpError) {
      return;
    }
    const ip = this.staticIp.trim();
    await this.apply(
      () => this.electronService.invoke('network-adapter-set-static', { ifIndex: adapter.ifIndex, ip, prefixLength: TIMING_PREFIX_LENGTH }),
      `"${adapter.name}" is now set to ${ip}.`
    );
  }

  async setAutomatic(): Promise<void> {
    const adapter = this.selectedAdapter;
    if (!adapter) {
      return;
    }
    await this.apply(
      () => this.electronService.invoke('network-adapter-set-automatic', { ifIndex: adapter.ifIndex }),
      `"${adapter.name}" is back to automatic (DHCP).`
    );
  }

  get visibleAdapters(): NetworkAdapter[] {
    return this.showAllAdapters ? this.adapters() : this.adapters().filter(a => a.kind === 'wired');
  }

  get hiddenAdapterCount(): number {
    return this.adapters().length - this.visibleAdapters.length;
  }

  get selectedAdapter(): NetworkAdapter | undefined {
    return this.adapters().find(a => a.ifIndex === this.selectedIfIndex());
  }

  get subnetPrefix(): string {
    return getMatSubnetPrefix(this.matIps);
  }

  get subnetConflicts(): NetworkAdapter[] {
    const selectedIfIndex = this.selectedIfIndex();
    if (selectedIfIndex === null) {
      return [];
    }
    return findSubnetConflicts(this.adapters(), selectedIfIndex, this.subnetPrefix);
  }

  get staticIpError(): string {
    const ip = this.staticIp.trim();
    if (!isValidIpv4(ip)) {
      return 'Enter a full IP address, e.g. 192.168.1.200.';
    }
    if (this.matIps.includes(ip)) {
      return 'That address belongs to a timing mat. Pick a different one.';
    }
    const host = Number(ip.split('.')[3]);
    if (host === 0 || host === 255) {
      return 'The last number must be between 1 and 254.';
    }
    return '';
  }

  get staticIpWarning(): string {
    const ip = this.staticIp.trim();
    if (this.staticIpError || this.matIps.length === 0 || subnetPrefixOf(ip) === this.subnetPrefix) {
      return '';
    }
    return `Your timing mats are on ${this.subnetPrefix}.x, so they won't be reachable from this address.`;
  }

  isRecommended(adapter: NetworkAdapter): boolean {
    return adapter.ifIndex === this.recommended()?.ifIndex;
  }

  private get matIps(): string[] {
    return this.matConnections.controls
      .map(control => String(control.get('ip')?.value ?? '').trim())
      .filter(ip => ip !== '');
  }

  // Keep an adapter's existing manual address on the timing subnet rather than proposing a new one.
  private defaultStaticIpFor(adapter: NetworkAdapter | undefined): string {
    const existing = adapter?.ipv4Mode === 'manual'
      ? adapter.addresses.find(a => subnetPrefixOf(a.ip) === this.subnetPrefix)
      : undefined;
    return existing?.ip ?? suggestStaticIp(this.matIps);
  }

  private async apply(action: () => Promise<unknown>, successMessage: string): Promise<void> {
    this.applying.set(true);
    this.applyMessage.set('');
    this.applyError.set('');
    try {
      await action();
      this.applyMessage.set(successMessage);
    } catch (err: any) {
      // Electron prefixes errors from ipcMain.handle with "Error invoking remote method '...': Error: ".
      this.applyError.set(String(err?.message ?? err).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''));
    } finally {
      this.applying.set(false);
    }
    await this.refresh();
  }
}
