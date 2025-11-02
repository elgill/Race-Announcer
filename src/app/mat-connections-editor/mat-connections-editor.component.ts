import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatConnection } from '../interfaces/mat-connection';
import {
  MatConnectionType,
  generateMatId,
  getDefaultPortForType,
  inferMatType,
  normalizeMatConnection
} from '../utils/mat-connection-helpers';

interface MatTypeOption {
  value: MatConnectionType;
  label: string;
}

@Component({
  selector: 'app-mat-connections-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mat-connections-editor.component.html',
  styleUrls: ['./mat-connections-editor.component.css']
})
export class MatConnectionsEditorComponent implements OnInit {
  @Input({ required: true }) matConnections!: FormArray;
  @Input() maxConnections = 3;

  dialogForm: FormGroup;
  dialogOpen = false;
  dialogTitle = '';
  editingIndex: number | null = null;

  matTypes: MatTypeOption[] = [
    { value: 'trident', label: 'Trident (10001)' },
    { value: 'raceResult', label: 'Race Result (3601)' },
    { value: 'other', label: 'Other' }
  ];

  constructor(private formBuilder: FormBuilder) {
    this.dialogForm = this.formBuilder.group({
      id: [''],
      label: ['', [Validators.required]],
      ip: ['', [Validators.required]],
      port: [{ value: getDefaultPortForType('trident'), disabled: true }, [Validators.required]],
      enabled: [true],
      type: ['trident' as MatConnectionType]
    });
  }

  ngOnInit(): void {
    // Ensure existing controls have type field populated
    this.matConnections.controls.forEach(control => {
      const group = control as FormGroup;
      const existingType = group.get('type')?.value as MatConnectionType | undefined;
      const inferredType = inferMatType(group.get('port')?.value, existingType);
      group.get('type')?.setValue(inferredType, { emitEvent: false });
    });
  }

  openAddDialog(): void {
    if (this.matConnections.length >= this.maxConnections) {
      return;
    }
    this.editingIndex = null;
    const defaultType: MatConnectionType = 'trident';
    this.dialogForm.reset({
      id: generateMatId(),
      label: `Timing Mat ${this.matConnections.length + 1}`,
      ip: '192.168.1.',
      port: getDefaultPortForType(defaultType),
      enabled: true,
      type: defaultType
    });
    this.setPortControlState(defaultType);
    this.dialogTitle = 'Add Timing Mat';
    this.dialogOpen = true;
  }

  openEditDialog(index: number): void {
    const group = this.matConnections.at(index) as FormGroup;
    const rawValue = group.getRawValue() as MatConnection;
    const type = inferMatType(rawValue.port, rawValue.type);

    this.editingIndex = index;
    this.dialogForm.reset({
      ...rawValue,
      type,
      port: type === 'other' ? rawValue.port : getDefaultPortForType(type)
    });
    this.setPortControlState(type);
    this.dialogTitle = 'Edit Timing Mat';
    this.dialogOpen = true;
  }

  closeDialog(): void {
    this.dialogOpen = false;
    this.editingIndex = null;
  }

  onTypeChange(type: MatConnectionType): void {
    this.dialogForm.get('type')?.setValue(type);
    this.setPortControlState(type);
  }

  saveMat(): void {
    if (this.dialogForm.invalid) {
      return;
    }

    const formValue = this.dialogForm.getRawValue() as MatConnection & { type: MatConnectionType };
    const normalized = normalizeMatConnection({
      ...formValue,
      port: Number(formValue.port)
    });

    if (this.editingIndex === null) {
      this.matConnections.push(this.createMatConnectionGroup(normalized));
    } else {
      const group = this.matConnections.at(this.editingIndex) as FormGroup;
      group.patchValue(normalized);
    }

    this.closeDialog();
  }

  removeMat(index: number): void {
    this.matConnections.removeAt(index);
  }

  get hasRoomForMore(): boolean {
    return this.matConnections.length < this.maxConnections;
  }

  typeLabel(type: MatConnectionType | null | undefined): string {
    switch (type) {
      case 'trident':
        return 'Trident';
      case 'raceResult':
        return 'Race Result';
      case 'other':
        return 'Other';
      default:
        return 'Unknown';
    }
  }

  private setPortControlState(type: MatConnectionType): void {
    const portControl = this.dialogForm.get('port');
    if (!portControl) {
      return;
    }

    if (type === 'other') {
      const currentValue = portControl.getRawValue();
      portControl.enable({ emitEvent: false });
      if (currentValue === getDefaultPortForType('trident') || currentValue === getDefaultPortForType('raceResult')) {
        portControl.setValue('', { emitEvent: false });
      }
    } else {
      portControl.disable({ emitEvent: false });
      portControl.setValue(getDefaultPortForType(type), { emitEvent: false });
    }
  }

  private createMatConnectionGroup(connection: MatConnection): FormGroup {
    return this.formBuilder.group({
      id: [connection.id || generateMatId()],
      label: [connection.label],
      ip: [connection.ip],
      port: [connection.port],
      enabled: [connection.enabled],
      type: [inferMatType(connection.port, connection.type)]
    });
  }
}
