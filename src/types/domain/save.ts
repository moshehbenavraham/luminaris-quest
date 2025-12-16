export type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export interface SaveState {
  status: SaveStatus;
  lastSaveTimestamp?: number;
  lastError?: string;
  retryCount: number;
  hasUnsavedChanges: boolean;
}

export enum SaveErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface SaveError {
  type: SaveErrorType;
  message: string;
  originalError?: unknown;
  timestamp: number;
}
