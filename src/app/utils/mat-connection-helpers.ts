import { MatConnection } from "../interfaces/mat-connection";

export type MatConnectionType = 'trident' | 'raceResult' | 'other';

const MAT_TYPE_DEFAULT_PORTS: Record<Exclude<MatConnectionType, 'other'>, number> = {
  trident: 10001,
  raceResult: 3601
};

export function generateMatId(): string {
  return `mat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function getDefaultPortForType(type: MatConnectionType): number {
  if (type === 'other') {
    return 0;
  }
  return MAT_TYPE_DEFAULT_PORTS[type];
}

export function inferMatType(port?: number, existingType?: MatConnectionType): MatConnectionType {
  if (existingType) {
    return existingType;
  }
  switch (port) {
    case MAT_TYPE_DEFAULT_PORTS.trident:
      return 'trident';
    case MAT_TYPE_DEFAULT_PORTS.raceResult:
      return 'raceResult';
    default:
      return 'other';
  }
}

export function normalizeMatConnection(connection: MatConnection): MatConnection {
  const type = inferMatType(connection.port, connection.type);
  const port = type === 'other'
    ? connection.port
    : MAT_TYPE_DEFAULT_PORTS[type];

  return {
    ...connection,
    type,
    port
  };
}
