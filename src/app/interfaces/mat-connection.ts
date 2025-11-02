export interface MatConnection {
  id: string; // Unique identifier for this mat
  label: string; // Custom name like "Start Line", "Finish Line", etc.
  ip: string;
  port: number;
  enabled: boolean;
}
