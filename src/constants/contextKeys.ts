export const CONTEXT_KEYS = {
  NONE: 'None',
  GMAIL: 'Gmail',
  DRIVE: 'Drive',
  DEPLOY_CONSOLE: 'DeployConsole',
} as const;

export type ContextKey = (typeof CONTEXT_KEYS)[keyof typeof CONTEXT_KEYS];

export interface ContextOption {
  value: ContextKey;
  label: string;
}

export const CONTEXT_OPTIONS: ContextOption[] = [
  { value: CONTEXT_KEYS.NONE, label: 'None' },
  { value: CONTEXT_KEYS.GMAIL, label: 'Gmail' },
  { value: CONTEXT_KEYS.DRIVE, label: 'Drive' },
  { value: CONTEXT_KEYS.DEPLOY_CONSOLE, label: 'DeployConsole' },
];

