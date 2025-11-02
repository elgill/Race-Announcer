export interface ChipRead {
  readerId: string;
  antennaId: string;
  chipCode: string;
  date: Date;
  matId?: string; // ID of the timing mat that detected this read
}
