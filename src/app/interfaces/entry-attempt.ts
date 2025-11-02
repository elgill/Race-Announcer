export interface EntryAttempt {
  bib: string;
  timestamp: Date;
  entrySource: 'manual' | 'automated';
  wasShown: boolean; // Whether this entry was actually displayed (not blocked by minTimeMs)
  matId?: string; // ID of the timing mat that detected this entry (if automated)
}
