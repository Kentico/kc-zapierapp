import { WebhookContracts } from '@kontent-ai/management-sdk';

export const parseWebhookWorkflowTrigger = (v: unknown): WebhookContracts.WebhookWorkflowStepOperationContract[] | null =>
  isArrayOf(isWebhookWorkflowEvent, v)
    ? v
    : null;

export const parseWebhookContentChangeTrigger = (v: unknown): WebhookContracts.WebhookManagementContentChangesOperation[] | null =>
  isArrayOf(isWebhookContentChangeEvent, v)
    ? v
    : null;

const isArrayOf = <T>(guard: (v: unknown) => v is T, v: unknown): v is T[] =>
  Array.isArray(v) &&
  v.every(guard);

const isWebhookWorkflowEvent = (v: unknown): v is WebhookContracts.WebhookWorkflowStepOperationContract =>
  typeof v === 'string' && ['publish', 'unpublish', 'archive', 'restore', 'upsert'].includes(v);

const isWebhookContentChangeEvent = (v: unknown): v is WebhookContracts.WebhookManagementContentChangesOperation =>
  typeof v === 'string' && ['archive', 'create', 'restore'].includes(v);
