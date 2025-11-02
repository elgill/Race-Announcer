export interface EntryAttempt {
  bib: string;
  timestamp: Date;
  entrySource: 'manual' | 'automated';
  wasShown: boolean; // Whether this entry was actually displayed (not blocked by minTimeMs)
}
